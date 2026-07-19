import React from "react";
import { useLocation } from "react-router-dom";

const Match = () => {
    const location = useLocation();
    const gameTeams = location.state?.gameTeam || [];

    return (
        <div>
            <h1>Match Found!</h1>

            {gameTeams.map((team, teamIndex) => (
                <table
                    key={teamIndex}
                    border="1"
                    style={{ marginBottom: "20px" }}
                >
                    <thead>
                        <tr>
                            <th colSpan="2">Team {teamIndex + 1}</th>
                        </tr>
                        <tr>
                            <th>User ID</th>
                            <th>Game Score</th>
                        </tr>
                    </thead>

                    <tbody>
                        {team.map((member) => (
                            <tr key={member.userId}>
                                <td>{member.userId}</td>
                                <td>{member.gameScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ))}
        </div>
    );
};

export default Match;