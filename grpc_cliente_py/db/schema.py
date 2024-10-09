def create_tables(conn):
    cursor = conn.cursor()
    
    queries = [
        '''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_usuario TEXT UNIQUE NOT NULL,
            contrasena TEXT NOT NULL,
            tienda_id TEXT,
            nombre TEXT,
            apellido TEXT,
            habilitado BOOLEAN
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            codigo TEXT UNIQUE NOT NULL,
            talle TEXT,
            foto TEXT,
            color TEXT,
            cantidad_stock_proveedor INTEGER DEFAULT 0  -- Nuevo campo para stock en proveedor
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS tiendas (
            codigo TEXT PRIMARY KEY,
            direccion TEXT,
            ciudad TEXT,
            provincia TEXT,
            habilitada BOOLEAN
        )
        ''',
        '''
        CREATE TABLE IF NOT EXISTS producto_tienda (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER,
            tienda_id TEXT,
            color TEXT,
            talle TEXT,
            cantidad INTEGER,
            FOREIGN KEY (producto_id) REFERENCES productos(id),
            FOREIGN KEY (tienda_id) REFERENCES tiendas(codigo)
        )
        ''',
        '''
       CREATE TABLE IF NOT EXISTS ordenes_compra (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tienda_id TEXT,
            fecha_solicitud TEXT,
            fecha_envio TEXT,         -- Nueva columna: Fecha estimada o real de envío
            fecha_recepcion TEXT,     -- Nueva columna: Fecha en la que se recibió la mercadería
            estado TEXT CHECK (estado IN ('SOLICITADA', 'RECHAZADA', 'ACEPTADA', 'PAUSADA')) NOT NULL,
            observaciones TEXT,
            FOREIGN KEY (tienda_id) REFERENCES tiendas(codigo)
        );
        ''',
        '''
        CREATE TABLE IF NOT EXISTS items_orden_compra (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orden_compra_id INTEGER,
            producto_id INTEGER,
            color TEXT,
            talle TEXT,
            cantidad INTEGER CHECK (cantidad > 0),
            FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id),
            FOREIGN KEY (producto_id) REFERENCES productos(id)
        );
        ''', 
        '''
        CREATE TABLE IF NOT EXISTS ordenes_despacho (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orden_compra_id INTEGER,
            fecha_estimacion_envio TEXT,  -- Fecha estimada de envío
            estado TEXT CHECK (estado IN ('PENDIENTE', 'ENVIADO', 'RECIBIDO')) NOT NULL,
            FOREIGN KEY (orden_compra_id) REFERENCES ordenes_compra(id)
        )
        '''
    ]
    
    for query in queries:
        print(f"Ejecutando consulta: {query}")
        cursor.execute(query)
    
    conn.commit()
