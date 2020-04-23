let queryable = require("queryable");

/**
 * Build simple and similar DB for meta information as `publishers`, `categories` or `mechanics`.
 *
 * @param {string} path - Path to the DB file
 * @return {object} db and functions to export
 */
module.exports = function dbBuilder(path) {
	let db = queryable.open(path);

	function find(foreignID) {
		return db.find({
			foreignID
		});
	}

	function has({ foreignID }) {
		return !!find(foreignID).length;
	}

	function addMultipleIfNotPresent(data = []) {
		let shouldSave = false;
		let result = data.map((datum) => {
			if (!has(datum)) {
				shouldSave = true;
				db.insert(datum);
			}

			return datum.foreignID;
		});

		if (shouldSave) {
			db.save();
		}

		return result;
	}

	return {
		db,
		exports: {
			has,
			find,
			addMultipleIfNotPresent
		}
	};
};
