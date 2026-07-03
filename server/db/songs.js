const db = require("./database");



function getSongById(id, callback) {

    const sql = `
        SELECT *
        FROM songs
        WHERE id = ?
    `;

    db.get(sql, [id], (err, row) => {

        if (err) {
            callback(err);
            return;
        }

        if (row) {
            row.notes = JSON.parse(row.notes);
        }

        callback(null, row);

    });

}



function createSong(song, callback) {

    const sql = `
        INSERT INTO songs(name, composer, bpm, difficulty, notes)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            song.name,
            song.composer,
            song.bpm,
            song.difficulty,
            JSON.stringify(song.notes)
        ],
        function(err) {

            if (err) {
                callback(err);
                return;
            }

            callback(null, this.lastID);

        }
    );

}

function getSongs(callback) {

    db.all("SELECT * FROM songs", [], (err, rows) => {

        if (err) {
            callback(err);
            return;
        }

        rows.forEach(song => {
            song.notes = JSON.parse(song.notes);
        });

        callback(null, rows);

    });

}

module.exports = {
    createSong,
    getSongs,
    getSongById
};