import React, { useState } from "react";
import { browserName, CustomView } from 'react-device-detect';

const InteractComponent = () => {
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("");
  const [script, setScript] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command, browserType: browserName }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.message || "Command executed successfully!");
        setScript(data.script.replace(/```javascript|```/g, "").trim());
      } else {
        setResponse(data.error || "Something went wrong.");
      }
    } catch (error) {
      setResponse("Failed to connect to the server.");
    }
  };

  return (
    <div >
      <div style={{ marginTop: "10%", textAlign: "center", fontSize: "60px", fontWeight: 600 }}>
        <span style={{ color: "hsl(210, 98%, 48%)", }}>Crustdata</span> Build Challenge</div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "hsl(200, 1.40%, 42.50%)", marginTop: "10px", textAlign: "center", fontSize: "18px", }}>
        <div style={{ width: "70%", }}>
          Just type your command, and our AI will handle everything—no coding, no hassle, just pure automation magic! 🚀
        </div>
        <textarea
          style={{ boxShadow: "2px 2px 10px rgb(204, 196, 196)", fontFamily: "Lexend", border: "0px", marginTop: "35px", borderRadius: "16px", padding: "20px", width: "400px", height: "150px" }}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter your natural language command"
        />
        <div >
          <button style={{ fontFamily: "Lexend", backgroundColor: "#FFCE2C", border: "0px", color: "#f8f8f8", fontWeight: 500, marginRight: "20px", marginTop: "12px", borderRadius: "15px", padding: "10px 15px", fontSize: "18px" }}
            onClick={handleSubmit}>Submit</button>

          <button style={{ fontFamily: "Lexend", backgroundColor: "#FFCE2C", border: "0px", color: "#f8f8f8", fontWeight: 500, marginRight: "20px", marginTop: "12px", borderRadius: "15px", padding: "10px 15px", fontSize: "18px" }}
            onClick={() => setCommand("")}> Clear </button>
        </div>

      </div>
      <div style={{ fontFamily: "Lexend", marginTop:"30px", display:"flex", flexDirection:"row"}}>
        {/* <div style={{width: "50%", padding:"20px" }}>Response: {response}</div> */}
        {/* <div style={{width: "50%" }}>Gemini-1.5-flash response: {script}</div> */}
      </div>


    </div>
  );
};

export default InteractComponent;
