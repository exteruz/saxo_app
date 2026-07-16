En este apartado se encuentra el funcionamiento de la base de datos.
Esta es creada a traves de un script en javascrip y cuenta con una sola tabla donde se guardan las canciones.
La tabla esta compuesta por los siguientes fields.
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            composer TEXT,
            bpm INTEGER NOT NULL,
            difficulty TEXT NOT NULL,
            notes TEXT NOT NULL,
Es importante destacar que el field notes esta compuesto por json el cual consta de la nota correspondiente asi como el valor de tiempo 
que esta dura.
