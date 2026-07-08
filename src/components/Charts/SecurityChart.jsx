import "./SecurityChart.css";

function SecurityChart() {

    const values = [80, 120, 70, 150, 100, 170, 140];

    return (

        <div className="chart-card">

            <h2>Security Activity</h2>

            <div className="bars">

                {
                    values.map((value,index)=>(
                        <div
                            key={index}
                            className="bar"
                            style={{height:value}}
                        ></div>
                    ))
                }

            </div>

        </div>

    );

}

export default SecurityChart;