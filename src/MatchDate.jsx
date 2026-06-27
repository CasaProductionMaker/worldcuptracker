import UpcomingMatch from './UpcomingMatch';

function MatchDate(props) {
	const matchesElements = props.matches.map((match, idx) => {
		return (
			<UpcomingMatch key={idx} match={match} groupStandings={props.groupStandings} currentMatchData={props.currentMatchData} />
		)
	});

	const today = new Date();
	const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

	return (
		<div className={`match_date ${props.date === localToday ? "today_date" : ""}`}>
			<h3>{new Date(props.date + 'T12:00:00').toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })} {props.date === localToday && "(Today)"}</h3>
			<div>
				{matchesElements}
			</div>
		</div>
	)
}

export default MatchDate
