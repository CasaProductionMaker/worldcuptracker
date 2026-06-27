export function NormalizeTeamName(name) {
	const nameMap = {
		"United States": "USA",
		"Czechia": "Czech Republic",
		"Bosnia-Herzegovina": "Bosnia & Herzegovina",
		"Türkiye": "Turkey",
		"Congo DR": "DR Congo",
	};
	return nameMap[name] || name;
};

export function ESPNTeamName(name) {
	const nameMap = {
        "USA": "United States",
        "Czech Republic": "Czechia",
        "Bosnia & Herzegovina": "Bosnia-Herzegovina",
        "Turkey": "Türkiye",
        "DR Congo": "Congo DR",
    };
	return nameMap[name] || name;
};

function Group(props) {
	const groupTeamElements = props.groupInfo.standings.entries.sort((a, b) => 
		a.note.rank - b.note.rank
	).map((entry, idx) => {
		return (
			<tr key={idx}>
				<td>{entry.note.rank}</td>
				<td className="hoverPointer" onClick={() => props.searchForTeam(NormalizeTeamName(entry.team.name))}>{NormalizeTeamName(entry.team.name)}</td>
				<td>{entry.stats[0].value}</td>
				<td>{entry.stats[7].value}</td>
				<td>{entry.stats[6].value}</td>
				<td>{entry.stats[1].value}</td>
				<td className="hide_mobile">{entry.stats[5].value}:{entry.stats[4].value}</td>
				<td>{entry.stats[2].value}</td>
				<td className="point_data">{entry.stats[3].value}</td>
			</tr>
		)
	});

	return (
		<div className="group">
			<h3>{props.groupInfo.name}</h3>
			<table>
				<thead>
					<tr>
						<th>Place</th>
						<th>Country</th>
						<th>P</th>
						<th>W</th>
						<th>D</th>
						<th>L</th>
						<th className="hide_mobile">GS:GC</th>
						<th>GD</th>
						<th className="point_header">Points</th>
					</tr>
				</thead>
				<tbody>
					{groupTeamElements}
				</tbody>
			</table>
		</div>
	)
}

export default Group
