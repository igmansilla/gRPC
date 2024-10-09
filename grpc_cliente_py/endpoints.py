from flask import Blueprint, jsonify, request
from services.orden_de_compra_service import OrdenDeCompraService
from kafka_producer import KafkaProducer
from datetime import datetime, timedelta

def create_orden_de_compra_blueprint(db):
    orden_de_compra_blueprint = Blueprint('orden_de_compra', __name__)

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

        orden = orden_de_compra_service.obtener_orden_por_id(orden_id)
        if not orden:
            return jsonify({'error': 'Orden no encontrada'}), 404

        errores = []
        faltantes_stock = []

        for item in orden['articulos']:
            articulo = orden_de_compra_service.obtener_articulo_por_id(item['id'])
            if not articulo or item['cantidad'] < 1:
                errores.append(f"Artículo {item['id']}: {'no existe' if not articulo else 'cantidad mal informada'}")
            elif item['cantidad'] > articulo['stock']:
                faltantes_stock.append(item['id'])

        if errores:
            nuevo_estado = 'RECHAZADA'
            mensaje = ', '.join(errores)
            mensaje_kafka = {'orden_id': orden_id, 'nuevo_estado': nuevo_estado, 'errores': mensaje}
            orden_de_compra_service.kafka_producer.send_message('/solicitudes', mensaje_kafka)
        elif faltantes_stock:
            nuevo_estado = 'ACEPTADA (PAUSADA)'
            mensaje = f"Artículos sin stock: {', '.join(faltantes_stock)}"
            mensaje_kafka = {'orden_id': orden_id, 'nuevo_estado': nuevo_estado, 'faltantes': mensaje}
            orden_de_compra_service.kafka_producer.send_message('/solicitudes', mensaje_kafka)
        else:
            nuevo_estado = 'ACEPTADA'
            mensaje_kafka = {'orden_id': orden_id, 'nuevo_estado': nuevo_estado}
            orden_de_compra_service.kafka_producer.send_message('/solicitudes', mensaje_kafka)

            orden_despacho_id = orden_de_compra_service.generar_orden_despacho(orden_id)
            fecha_estimacion = orden_de_compra_service.calcular_fecha_estimacion()
            mensaje_despacho = {
                'orden_despacho_id': orden_despacho_id,
                'orden_id': orden_id,
                'fecha_estimacion': fecha_estimacion
            }
            orden_de_compra_service.kafka_producer.send_message('/despacho', mensaje_despacho)

            orden_de_compra_service.restar_stock(orden)

        orden_de_compra_service.actualizar_estado_orden(orden_id, nuevo_estado)

        return jsonify({'mensaje': 'Estado de la orden de compra actualizado con éxito', 'nuevo_estado': nuevo_estado}), 200

    return orden_de_compra_blueprint

def create_producto_blueprint(db):
    producto_blueprint = Blueprint('productos', __name__)
    kafka_producer = KafkaProducer()

    @producto_blueprint.route('/productos', methods=['GET'])
    def obtener_productos():
        productos = db.get_productos()

        return jsonify(productos)

    @producto_blueprint.route('/productos/modificar', methods=['PUT'])
    def modificar_stock():
        data = request.get_json()

        producto_id = data.get('producto_id')
        nueva_cantidad = data.get('nueva_cantidad')

        if not producto_id or nueva_cantidad is None:
            return jsonify({'error': 'Faltan datos necesarios'}), 400

        try:
            cursor = db.get_cursor()
            cursor.execute("""
                UPDATE productos
                SET cantidad_stock_proveedor = ?
                WHERE codigo = ?
            """, (nueva_cantidad, producto_id))

            cursor.execute("""
                SELECT oc.id, oc.tienda_id, ioc.cantidad
                FROM ordenes_compra oc
                JOIN items_orden_compra ioc ON oc.id = ioc.orden_compra_id
                WHERE ioc.producto_id = ? AND oc.estado = 'PAUSADA'
            """, (producto_id,))

            ordenes_pausadas = cursor.fetchall()
            
            print("Ordenes pausadas:", ordenes_pausadas)

            for orden in ordenes_pausadas:
                orden_id = orden[0]
                cantidad_solicitada = int(orden[2]) 
                nueva_cantidad = int(nueva_cantidad)  

                if nueva_cantidad >= cantidad_solicitada:
                    cursor.execute("""
                        UPDATE ordenes_compra
                        SET estado = 'ACEPTADA'
                        WHERE id = ?
                    """, (orden_id,))

                    nueva_cantidad -= cantidad_solicitada
                    
                    cursor.execute(
                        '''
                        INSERT INTO ordenes_despacho (orden_compra_id, fecha_estimacion_envio, estado)
                        VALUES (?, datetime('now', '+7 days'), 'PENDIENTE')  -- Estado inicial 'PENDIENTE'
                        ''',
                        (orden_id,)
                    )
                    
                    fecha_estimacion_envio = datetime.now() + timedelta(days=7)
                    orden_despacho_id = cursor.lastrowid
                    print(f"Orden de despacho generada con ID: {orden_despacho_id}")
        
                    mensaje_despacho = {
                        'orden_despacho_id': orden_despacho_id,
                        'orden_compra_id': orden_id,
                        'fecha_estimacion_envio': fecha_estimacion_envio.isoformat()  
                    }
                    
                    kafka_producer.send_message("despacho", mensaje_despacho)
                   

            db.commit()

            return jsonify({'message': 'Stock modificado y órdenes reprocesadas'}), 200

        except Exception as e:
            db.rollback()  
            return jsonify({'error': str(e)}), 500

    def generar_orden_despacho(cursor, orden_compra_id):
        """Genera una nueva orden de despacho y devuelve su ID."""
        cursor.execute(
            '''
            INSERT INTO ordenes_despacho (orden_compra_id, fecha_estimacion_envio, estado)
            VALUES (?, datetime('now', '+7 days'), 'PENDIENTE')  -- Estado inicial 'PENDIENTE'
            ''',
            (orden_compra_id,)
        )
        return cursor.lastrowid

   
        


    @producto_blueprint.route('/alta', methods=['POST'])
    def alta_producto():
        """
        Endpoint para dar de alta un nuevo producto.
        """
        data = request.get_json()

        codigo = data.get('codigo')
        nombre = data.get('nombre')
        talles = data.get('talles', [])  
        colores = data.get('colores', [])  
        urls = data.get('urls', []) 
        cantidad_stock_proveedor = data.get('cantidad_stock_proveedor')

        if not all([codigo, nombre, talles, colores, urls, cantidad_stock_proveedor]):
            return jsonify({'error': 'Faltan datos necesarios'}), 400

        try:
            cursor = db.get_cursor()
            cursor.execute("""
                INSERT INTO productos (codigo, nombre, talle, color, foto, cantidad_stock_proveedor)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (codigo, nombre, ','.join(talles), ','.join(colores), ','.join(urls), cantidad_stock_proveedor))

            producto_id = cursor.lastrowid
            
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

            db.commit()  

            return jsonify({'message': 'Producto creado exitosamente'}), 201

        except Exception as e:
            return jsonify({'error': str(e)}), 500
        
    return producto_blueprint