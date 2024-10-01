# endpoints.py
from flask import Blueprint, jsonify, request
from services.orden_de_compra_service import OrdenDeCompraService

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
