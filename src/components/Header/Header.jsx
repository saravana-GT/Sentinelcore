import "./Header.css";

function Header() {
  return (
    <div className="header">

      <input
        type="text"
        placeholder="🔍 Search..."
      />

      <div className="header-right">

        <span>🔔</span>

        <span>👤 Varsha</span>

      </div>

    </div>
  );
}

export default Header;