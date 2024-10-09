def insert_test_data(conn):
    cursor = conn.cursor()
    
    queries = [
        '''
        INSERT INTO usuarios (nombre_usuario, contrasena, tienda_id, nombre, apellido, habilitado)
        VALUES ('juan', '1', 'T001', 'Juan', 'Pérez', 1)
        ''',
        '''
        INSERT INTO usuarios (nombre_usuario, contrasena, tienda_id, nombre, apellido, habilitado)
        VALUES ('ana', '2', 'T002', 'Ana', 'Gómez', 1)
        '''
    ]
    for query in queries:
        print(f"Ejecutando consulta: {query}")
        cursor.execute(query)
    
    queries = [
        '''
       INSERT INTO productos (nombre, codigo, talle, foto, color, cantidad_stock_proveedor)
       VALUES ('Producto A', 'A001', 'M', 'url/to/fotoA', 'Rojo', 0),  -- Incluyendo la cantidad de stock
            ('Producto B', 'B002', 'L', 'url/to/fotoB', 'Azul', 150);  -- Incluyendo la cantidad de stock

        '''
    ]
    for query in queries:
        print(f"Ejecutando consulta: {query}")
        cursor.execute(query)
    
    queries = [
        '''
        INSERT INTO tiendas (codigo, direccion, ciudad, provincia, habilitada)
        VALUES ('T001', 'Calle Falsa 123', 'Ciudad X', 'Provincia X', 1)
        ''',
        '''
        INSERT INTO tiendas (codigo, direccion, ciudad, provincia, habilitada)
        VALUES ('T002', 'Calle Verdadera 456', 'Ciudad Y', 'Provincia Y', 1)
        '''
    ]
    for query in queries:
        print(f"Ejecutando consulta: {query}")
        cursor.execute(query)
    
    queries = [
        '''
        INSERT INTO producto_tienda (producto_id, tienda_id, color, talle, cantidad)
        VALUES ((SELECT id FROM productos WHERE codigo='A001'), 'T001', 'Rojo', 'M', 100)
        ''',
        '''
        INSERT INTO producto_tienda (producto_id, tienda_id, color, talle, cantidad)
        VALUES ((SELECT id FROM productos WHERE codigo='B002'), 'T002', 'Azul', 'L', 150)
        '''
    ]
    for query in queries:
        print(f"Ejecutando consulta: {query}")
        cursor.execute(query)
    
    conn.commit()
