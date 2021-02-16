/* eslint-disable filenames/match-exported */
const request = require("request");
const xml2json = require("xml2json");
const { Router } = require("express");
const router = new Router();

let convertXmlToJson = (xml, search) => {
	let raw = JSON.parse(xml2json.toJson(xml));
	if (raw.items.total === "0" || !raw.items.item) {
		return [];
	}

	if (raw.items.total === "1") {
		raw.items.item = [raw.items.item];
	}

	let expansions = {};

	return raw.items.item
		.map((data) => {
			let thing = {
				type: data.type,
				name: data.name.value,
				nameType: data.name.type,
				search,
				id: data.id,
				source: "boardgamegeek",
				page: `https://www.boardgamegeek.com/${data.type}/${data.id}`
			};

			if (data.type === "boardgameexpansion") {
				expansions[data.id] = data;
			}

			if (data.yearpublished) {
				thing.yearpublished = data.yearpublished.value;
			}

			return thing;
		})
		.filter((each) => each.source !== "boardgamegeek" || each.type !== "boardgame" || !expansions[each.id]);
};

router.route("/bgg")
	.get((req, res) => {
		let uri = `https://www.boardgamegeek.com/xmlapi2/search?query=${encodeURI(req.query.name)}&type=${req.query.type}`;
		if (req.query.exact === "true") {
			uri += "&exact=1";
		}
		request.get(uri, (err, { statusCode }, body) => {
			if (!err && statusCode === 200) {
				res.setHeader("Content-Type", "application/json");
				res.send(convertXmlToJson(body, req.query.name));
			} else {
				res.status(500);
				res.setHeader("Content-Type", "application/json");
				res.send(JSON.stringify({
					error: err,
					code: 500
				}));
			}
		});
	});

module.exports = router;
