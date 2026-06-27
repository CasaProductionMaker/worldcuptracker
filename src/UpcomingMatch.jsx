import { Tooltip } from 'react-tooltip';
import { ESPNTeamName } from './Group';
import { useState } from 'react';

function UpcomingMatch(props) {
	const [highlights, setHighlights] = useState(null);
	const parseMatchDate = (date, time) => {
		const offset = time.match(/UTC([+-]\d+)/)[1];
		const paddedOffset = offset.replace(/([+-])(\d)$/, '$10$2');
		return new Date(`${date}T${time.split(' ')[0]}${paddedOffset}:00`);
	};

	function formatWinnerLoser(team) {
		if (team[0] == "W" && parseInt(team.slice(1), 10) != null) {
			return "Winner of match #" + parseInt(team.slice(1), 10);
		}
		if (team[0] == "L" && parseInt(team.slice(1), 10) != null) {
			return "Loser of match #" + parseInt(team.slice(1), 10);
		}
		return team;
	}

	const formattedTime = parseMatchDate(props.match.date, props.match.time).toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});

	function getTeamRank(group, team) {
		const child = props.groupStandings.children?.find(child => child.name == group);
		if (child == undefined) return "unknown";
		const normalizedTeam = ESPNTeamName(team);
		const entry = child.standings.entries.find(entry => entry.team.name === normalizedTeam);
		if (entry == undefined) return "unknown";
		return entry.note.rank;
	}
	function getTeamStat(group, team, stat) {
		const child = props.groupStandings.children?.find(child => child.name == group);
		if (child == undefined) {
			console.log(team);
			console.log(props.groupStandings);
			console.log(group);
			return "unknown"
		};
		const normalizedTeam = ESPNTeamName(team);
		const entry = child.standings.entries.find(entry => entry.team.name === normalizedTeam);
		if (entry == undefined) return "unknown";
		return entry.stats[stat].value;
	}

	function getCurrentMatch() {
		return props.currentMatchData?.find(match => match.name?.includes(ESPNTeamName(props.match.team1)) && match.name?.includes(ESPNTeamName(props.match.team2)))
	}

	function getScoreText() {
		if (getCurrentMatch() != null) {
			// return live score
			return getCurrentMatch().competitions?.[0].competitors?.find( team => team.team.name == ESPNTeamName(props.match.team1) )?.score + " - " + getCurrentMatch().competitions?.[0].competitors.find( team => team.team.name == ESPNTeamName(props.match.team2) )?.score;
		} else if (props.match.score) {
			return props.match.score.ft.join(' - ');
		} else {
			return formattedTime;
		}
	}

	const getMatchHighlights = async (matchDate, team1, team2) => {
		const dateStr = matchDate.replace(/-/g, ''); // "20260617"
		const response = await fetch(`/espn/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`);
		const data = await response.json();
		
		const match = data.events.find(e => 
			e.name.includes(team1) || e.name.includes(team2)
		);
		
		return {
			headline: match?.competitions[0].headlines?.[0]?.description,
			details: match?.competitions[0].details
		};
	};

	const handleHighlightsOpen = async () => {
		const data = await getMatchHighlights(props.match.date, ESPNTeamName(props.match.team1), ESPNTeamName(props.match.team2));
		setHighlights(data);
	};

	const hasFinished = props.match.score != null;

	const liveText = "LIVE: " + getCurrentMatch()?.status.displayClock;

	return (
		<div className={`upcoming_match ${getCurrentMatch() ? "live_match" : ""}`}>
			<div className="left_team">
				<h2 data-tooltip-id={"team_" + props.match.team1 + "_in_match_against" + props.match.team2 + "_name_popup"} data-tooltip-place="bottom">{formatWinnerLoser(props.match.team1)}</h2>
				<Tooltip id={"team_" + props.match.team1 + "_in_match_against" + props.match.team2 + "_name_popup"} className="tooltip" clickable={true} openOnClick={true}>
					{props.match.group == null ? <p>Not available.</p> : 
						<table>
							<thead>
								<tr>
									<th>Place</th>
									<th>P</th>
									<th>W</th>
									<th>D</th>
									<th>L</th>
									<th>GS:GC</th>
									<th>GD</th>
									<th className="point_header">Points</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>{getTeamRank(props.match.group, props.match.team1)}</td>
									<td>{getTeamStat(props.match.group, props.match.team1, 0)}</td>
									<td>{getTeamStat(props.match.group, props.match.team1, 7)}</td>
									<td>{getTeamStat(props.match.group, props.match.team1, 6)}</td>
									<td>{getTeamStat(props.match.group, props.match.team1, 1)}</td>
									<td>{getTeamStat(props.match.group, props.match.team1, 5)}:{getTeamStat(props.match.group, props.match.team1, 4)}</td>
									<td>{getTeamStat(props.match.group, props.match.team1, 2)}</td>
									<td className="point_data">{getTeamStat(props.match.group, props.match.team1, 3)}</td>
								</tr>
							</tbody>
						</table>
					}
				</Tooltip>
				{props.match.group && <p className="team_ranking">#{getTeamRank(props.match.group, props.match.team1)} in group</p>}
			</div>
			<div className="middle_info">
				<p className="match_time">{getScoreText()}</p>
				<p className="match_round">{getCurrentMatch() ? liveText : props.match.round}</p>
				<p className="match_group">{props.match.group}</p>
				{hasFinished && 
					<>
						<p className="highlights_hover" onClick={handleHighlightsOpen} data-tooltip-id={"game_" + props.match.team1 + "_" + props.match.team2 + "_highlights_popup"} data-tooltip-place="bottom">Highlights</p>
						<Tooltip id={"game_" + props.match.team1 + "_" + props.match.team2 + "_highlights_popup"} className="tooltip stay_small" clickable={true} openOnClick={true}>
							<p>{highlights?.headline || "Loading..."}</p>
						</Tooltip>
					</>
				}
			</div>
			<div className="right_team">
				<h2 data-tooltip-id={"team_" + props.match.team2 + "_in_match_against" + props.match.team1 + "_name_popup"} data-tooltip-place="bottom">{formatWinnerLoser(props.match.team2)}</h2>
				<Tooltip id={"team_" + props.match.team2 + "_in_match_against" + props.match.team1 + "_name_popup"} className="tooltip" clickable={true} openOnClick={true}>
					{props.match.group == null ? <p>Not available.</p> : 
						<table>
							<thead>
								<tr>
									<th>Place</th>
									<th>P</th>
									<th>W</th>
									<th>D</th>
									<th>L</th>
									<th>GS:GC</th>
									<th>GD</th>
									<th className="point_header">Points</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>{getTeamRank(props.match.group, props.match.team2)}</td>
									<td>{getTeamStat(props.match.group, props.match.team2, 0)}</td>
									<td>{getTeamStat(props.match.group, props.match.team2, 7)}</td>
									<td>{getTeamStat(props.match.group, props.match.team2, 6)}</td>
									<td>{getTeamStat(props.match.group, props.match.team2, 1)}</td>
									<td>{getTeamStat(props.match.group, props.match.team2, 5)}:{getTeamStat(props.match.group, props.match.team2, 4)}</td>
									<td>{getTeamStat(props.match.group, props.match.team2, 2)}</td>
									<td className="point_data">{getTeamStat(props.match.group, props.match.team2, 3)}</td>
								</tr>
							</tbody>
						</table>
					}
				</Tooltip>
				{props.match.group && <p className="team_ranking">#{getTeamRank(props.match.group, props.match.team2)} in group</p>}
			</div>
		</div>
	)
}

export default UpcomingMatch
