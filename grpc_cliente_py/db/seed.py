def insert_test_data(conn):
    cursor = conn.cursor()
    
    # Insertar usuarios
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
    
    # Insertar productos
    queries = [
        '''
        INSERT INTO productos (nombre, codigo, talle, foto, color)
        VALUES ('Producto A', 'A001', 'M', 'url/to/fotoA', 'Rojo')
        ''',
        '''
        INSERT INTO productos (nombre, codigo, talle, foto, color)
        VALUES ('Producto B', 'B002', 'L', 'url/to/fotoB', 'Azul')
        '''
    ]
    for query in queries:
        print(f"Ejecutando consulta: {query}")
        cursor.execute(query)
    
    # Insertar tiendas
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
    
    # Insertar producto_tienda
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
