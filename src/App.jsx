import { useState, useEffect } from 'react'
import MatchDate from './MatchDate';
import Group from './Group';

// live scores: https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard
// openfootball (matches): https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json

function App() {
	// {
	// 	date: "2026-06-11",
	// 	goals1: [{name: "Julián Quiñones", minute: "9"}, {name: "Raúl Jiménez", minute: "67"}],
	// 	goals2: [],
	// 	ground: "Mexico City",
	// 	group: "Group A",
	// 	round: "Matchday 1",
	// 	score: {ft: [2, 0], ht: [1, 0]},
	// 	team1: "Mexico",
	// 	team2: "South Africa",
	// 	time: "13:00 UTC-6"
	// }
	const [matches, setMatches] = useState([]);
	const [groupStandings, setGroupStandings] = useState({});
	const [currentMatchData, setCurrentMatchData] = useState([]);
	const [settings, setSettings] = useState({
		show_past_matches: false, 
		current_search: ""
	});
	const [currentTab, setCurrentTab] = useState("matches");

	// matches
	function hasFilter(match, current_search) {
		return match.team1.toLowerCase().includes(current_search.toLowerCase()) || match.team2.toLowerCase().includes(current_search.toLowerCase());
	}

	useEffect(() => {
		const getOpenFootballData = async () => {
			const response = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
			const data = await response.json();
			setMatches(data.matches);
			console.log(data.matches)
		};
		getOpenFootballData();

		const getESPNStandingsData = async () => {
			const response = await fetch('/espn/apis/v2/sports/soccer/fifa.world/standings');
			const data = await response.json();
			// console.log(data);
			setGroupStandings(data);
			// data.children[groupIndex].standings.entries[teamIndex].stats
		};
		getESPNStandingsData();

		const getESPNCurrentMatchData = async () => {
			const response = await fetch('/espn/apis/site/v2/sports/soccer/fifa.world/scoreboard');
			const data = await response.json();
			setCurrentMatchData(data.events.filter(event => event.status.type.state === "in"));
			// data.children[groupIndex].standings.entries[teamIndex].stats
			// console.log(data.events[0].competitions[0].headlines[0])
		};
		getESPNCurrentMatchData();

		const interval = setInterval(getESPNCurrentMatchData, 30000); // then every 30 seconds

  		return () => clearInterval(interval); // cleanup on unmount
	}, []);

	const matchDates = matches.filter(match => {
		const now = new Date();
		const offset = match.time.match(/UTC([+-]\d+)/)[1]; // "-6"
		const paddedOffset = offset.replace(/([+-])(\d)$/, '$10$2'); // "-06"
		const kickoff = new Date(`${match.date}T${match.time.split(' ')[0]}${paddedOffset}:00`);
		const end = new Date(kickoff.getTime() + 115 * 60 * 1000);

		return hasFilter(match, settings.current_search) &&(kickoff >= now || (now >= kickoff && now <= end) || settings.show_past_matches);
	}).sort((a, b) => {
		const parseMatchDate = (match) => {
			const offset = match.time.match(/UTC([+-]\d+)/)[1];
			const paddedOffset = offset.replace(/([+-])(\d)$/, '$10$2');
			return new Date(`${match.date}T${match.time.split(' ')[0]}${paddedOffset}:00`);
		};

		return parseMatchDate(a) - parseMatchDate(b);
	}).reduce((groups, match) => {
		const date = match.date;
		if (!groups[date]) groups[date] = [];
		groups[date].push(match);
		return groups;
	}, {})

	const matchDatesElements = Object.entries(matchDates).map(([date, matches]) => 
		<MatchDate key={date} date={date} matches={matches} groupStandings={groupStandings} currentMatchData={currentMatchData} />
	)

	const groupElements = groupStandings.children?.map((group, idx) => {
		return (
			<Group key={idx} groupInfo={group} searchForTeam={searchForTeam} />
		)
	});

	function selectTab(tab) {
		setCurrentTab(tab);
	}

	function setSetting(key, value) {
		setSettings({...settings, [key]: value});
	}

	function searchForTeam(team) {
		selectTab("matches");
		setSettings({...settings, show_past_matches: true, current_search: team});
	}

	function scrollToToday() {
		const element = document.querySelector('.today_date');

		if (element) {
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	}

	return (
		<>
			<header>
				<div className="main_header">
					<h1>World Cup Matches 2026</h1>
					{/* <div className="kickoff_time">
						<p>Next kickoff in:</p>
						<h6>1h, 0m, 6s</h6>
					</div> */}
				</div>
				<div className="header_tabs">
					<button onClick={() => {selectTab("matches")}} className={currentTab == "matches" ? "selected" : ""}>Matches</button>
					<button onClick={() => {selectTab("groups")}} className={currentTab == "groups" ? "selected" : ""}>Groups</button>
				</div>
			</header>
			<main>
				{currentTab == "matches" && 
					<>
						<form className="matches_filters">
							<div className="search_container">
								<input type="search" name="team_search" id="team_search" placeholder="Search team..." value={settings.current_search} onChange={(e) => {setSetting("current_search", e.target.value)}} />
								<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<circle cx="11" cy="11" r="7"></circle>
									<path d="m21 21-4.3-4.3" strokeLinecap="round"></path>
								</svg>
							</div>
							<div className="show_past_matches">
								<input type="checkbox" id="show_past_matches" name="show_past_matches" checked={settings.show_past_matches} onChange={(e) => {setSetting("show_past_matches", e.target.checked)}} />
								<label htmlFor="show_past_matches">Show Past Matches</label>
							</div>
							<button type="button" className="scroll_to_today" onClick={scrollToToday}>Today</button>
						</form>
						<div className="matches_container">
							{matchDatesElements}
						</div>
					</>
				}
				{currentTab == "groups" && 
					<div className="groups_container">
						{groupElements}
					</div>
				}
			</main>
		</>
	)
}

export default App
