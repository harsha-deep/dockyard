import "./App.css";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [containers, setContainers] = useState([]);

  async function fetchDocker() {
    try {
      const result = await invoke("docker_ps");
      setContainers(result);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchDocker();
    const interval = setInterval(fetchDocker, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Image</th>
          <th>Status</th>
          <th>Ports</th>
        </tr>
      </thead>
      <tbody>
        {containers.map((c) => (
          <tr key={c.ID}>
            <td>{c.Names}</td>
            <td>{c.Image}</td>
            <td>{c.Status}</td>
            <td>{c.Ports}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default App;