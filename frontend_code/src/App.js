import logo from './logo.svg';
import './App.css';
import InteractComponent from './InteractComponent';

function App() {
  return (
    <div style={{ background: "radial-gradient(80% 50% at 50% -20%, rgb(204, 230, 255), transparent)" }}
      className='parent'>
      <div style={{display:"flex", justifyContent:"center", alignItems:"center", padding : "30px 0px 15px 0px" }}>
        <InteractComponent />
      </div>

    </div>
  );
}

export default App;
