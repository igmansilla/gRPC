# endpoints.py
from flask import Blueprint, jsonify, request
from services.orden_de_compra_service import OrdenDeCompraService
from kafka_producer import KafkaProducer

# Crear una función para configurar el Blueprint con la base de datos pasada como parámetro
def create_orden_de_compra_blueprint(db):
    # Crear el Blueprint para manejar los endpoints
    orden_de_compra_blueprint = Blueprint('orden_de_compra', __name__)

    # Instanciar el servicio de orden de compra con la base de datos pasada
    orden_de_compra_service = OrdenDeCompraService(db)

    @orden_de_compra_blueprint.route('/ordenes_compra', methods=['GET'])
    def obtener_ordenes_compra():
        """
        Endpoint para obtener todas las órdenes de compra.
        """
        try:
            ordenes_compra = orden_de_compra_service.obtener_ordenes_compra()
            print(f"Órdenes de compra obtenidas: {ordenes_compra}")
            return jsonify(ordenes_compra), 200
        except Exception as e:
            print(f"Error al obtener órdenes de compra: {e}")
            return jsonify({'error': 'Error al obtener órdenes de compra'}), 500

    @orden_de_compra_blueprint.route('/ordenes_compra/modificar', methods=['PUT'])
    def modificar_estado_orden_compra():
        """
        Endpoint para modificar el estado de una orden de compra.
        """
        data = request.get_json()
        orden_id = data.get('orden_id')
        
        if not orden_id:
            return jsonify({'error': 'Falta el parámetro requerido: orden_id'}), 400

        # Obtener detalles de la orden de compra
        orden = orden_de_compra_service.obtener_orden_por_id(orden_id)
        if not orden:
            return jsonify({'error': 'Orden no encontrada'}), 404

        errores = []
        faltantes_stock = []

        # Verificar artículos en la orden
        for item in orden['articulos']:
            # Comprobar si el artículo está disponible y la cantidad es válida
            articulo = orden_de_compra_service.obtener_articulo_por_id(item['id'])
            if not articulo or item['cantidad'] < 1:
                errores.append(f"Artículo {item['id']}: {'no existe' if not articulo else 'cantidad mal informada'}")
            elif item['cantidad'] > articulo['stock']:
                faltantes_stock.append(item['id'])

        # Determinar el estado de la orden según las reglas
        if errores:
            nuevo_estado = 'RECHAZADA'
            mensaje = ', '.join(errores)
            # Enviar mensaje al topic de solicitudes
            mensaje_kafka = {'orden_id': orden_id, 'nuevo_estado': nuevo_estado, 'errores': mensaje}
            orden_de_compra_service.kafka_producer.send_message('/solicitudes', mensaje_kafka)
        elif faltantes_stock:
            nuevo_estado = 'ACEPTADA (PAUSADA)'
            mensaje = f"Artículos sin stock: {', '.join(faltantes_stock)}"
            # Enviar mensaje al topic de solicitudes
            mensaje_kafka = {'orden_id': orden_id, 'nuevo_estado': nuevo_estado, 'faltantes': mensaje}
            orden_de_compra_service.kafka_producer.send_message('/solicitudes', mensaje_kafka)
        else:
            nuevo_estado = 'ACEPTADA'
            # Enviar información al topic de solicitudes
            mensaje_kafka = {'orden_id': orden_id, 'nuevo_estado': nuevo_estado}
            orden_de_compra_service.kafka_producer.send_message('/solicitudes', mensaje_kafka)

            # Generar orden de despacho
            orden_despacho_id = orden_de_compra_service.generar_orden_despacho(orden_id)
            fecha_estimacion = orden_de_compra_service.calcular_fecha_estimacion()
            mensaje_despacho = {
                'orden_despacho_id': orden_despacho_id,
                'orden_id': orden_id,
                'fecha_estimacion': fecha_estimacion
            }
            orden_de_compra_service.kafka_producer.send_message('/despacho', mensaje_despacho)

            # Actualizar stock
            orden_de_compra_service.restar_stock(orden)

        # Actualizar el estado de la orden en la base de datos
        orden_de_compra_service.actualizar_estado_orden(orden_id, nuevo_estado)

        return jsonify({'mensaje': 'Estado de la orden de compra actualizado con éxito', 'nuevo_estado': nuevo_estado}), 200

    return orden_de_compra_blueprint

# Crea el blueprint de productos
def create_producto_blueprint(db):
    producto_blueprint = Blueprint('productos', __name__)
    kafka_producer = KafkaProducer()

    # Ruta para obtener todos los productos
    @producto_blueprint.route('/productos', methods=['GET'])
    def obtener_productos():
        # Obtener todos los productos desde la base de datos
        productos = db.get_productos()

        # Devuelve los productos en formato JSON
        return jsonify(productos)

        return producto_blueprint
    # Ruta para modificar el stock de un producto
    @producto_blueprint.route('/productos/modificar', methods=['PUT'])
    async def modificar_stock():
        data = request.get_json()

        producto_id = data.get('producto_id')
        nueva_cantidad = data.get('nueva_cantidad')

        if not producto_id or nueva_cantidad is None:
            return jsonify({'error': 'Faltan datos necesarios'}), 400

        # Llamar a la base de datos para modificar el stock del producto
        try:
            cursor = db.get_cursor()
            cursor.execute("""
                UPDATE productos
                SET cantidad_stock_proveedor = ?
                WHERE id = ?
            """, (nueva_cantidad, producto_id))

            db.commit()  # Confirmar los cambios

            return jsonify({'message': 'Stock modificado exitosamente'}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

        return producto_blueprint

    # Ruta para dar de alta un nuevo producto
    @producto_blueprint.route('/productos/alta', methods=['POST'])
    def alta_producto():
        """
        Endpoint para dar de alta un nuevo producto.
        """
        data = request.get_json()

        # Extraer datos del producto del cuerpo de la solicitud
        codigo = data.get('codigo')
        nombre = data.get('nombre')
        talles = data.get('talles')
        colores = data.get('colores')
        urls = data.get('urls')
        cantidad_stock_proveedor = data.get('cantidad_stock_proveedor')

        # Validar que todos los campos necesarios están presentes
        if not all([codigo, nombre, talles, colores, urls, cantidad_stock_proveedor]):
            return jsonify({'error': 'Faltan datos necesarios'}), 400

        try:
            # Llamar a la base de datos para insertar el nuevo producto
            cursor = db.get_cursor()
            cursor.execute("""
                INSERT INTO productos (codigo, nombre, talles, colores, urls, cantidad_stock_proveedor)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (codigo, nombre, talles, colores, urls, cantidad_stock_proveedor))

            # Obtener el ID del producto insertado
            producto_id = cursor.lastrowid
            
            # Enviar mensaje a Kafka
            mensaje_kafka = {
                'producto_id': producto_id,
                'codigo': codigo,
                'nombre': nombre,
                'talles': talles,
                'colores': colores,
                'urls': urls,
                'cantidad_stock_proveedor': cantidad_stock_proveedor
            }
            kafka_producer.send_message("novedades", mensaje_kafka)

            db.commit()  # Confirmar los cambios

            return jsonify({'message': 'Producto creado exitosamente'}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return producto_blueprint