import "./RiskScore.css";

function RiskScore() {

    return (

        <div className="risk-card">

            <div className="risk-header">

                <h2>Organization Risk Score</h2>

                <span>Today</span>

            </div>

            <div className="risk-circle">

                <h1>72%</h1>

            </div>

            <h3>HIGH RISK</h3>

            <div className="risk-details">

                <div>
                    <p>Failed Login</p>
                    <b>18</b>
                </div>

                <div>
                    <p>Phishing Emails</p>
                    <b>14</b>
                </div>

                <div>
                    <p>Suspicious Files</p>
                    <b>7</b>
                </div>

                <div>
                    <p>Locked Accounts</p>
                    <b>2</b>
                </div>

            </div>

        </div>

    );

}

export default RiskScore;