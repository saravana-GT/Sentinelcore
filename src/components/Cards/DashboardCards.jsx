import "./DashboardCards.css";

function DashboardCards() {

    const cards = [

        {
            title:"Cyber Health",
            value:"98%",
            icon:"🛡"
        },

        {
            title:"Trust Score",
            value:"94%",
            icon:"⭐"
        },

        {
            title:"Alerts",
            value:"12",
            icon:"🚨"
        },

        {
            title:"Devices",
            value:"245",
            icon:"💻"
        }

    ];

    return (

        <div className="cards">

            {
                cards.map((card,index)=>(

                    <div className="card" key={index}>

                        <h2>{card.icon}</h2>

                        <h3>{card.title}</h3>

                        <h1>{card.value}</h1>

                    </div>

                ))
            }

        </div>

    );

}

export default DashboardCards;