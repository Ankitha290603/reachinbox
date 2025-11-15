import React, { useState, useEffect } from "react";
import { searchEmails, suggestReply } from "./api";

export default function App() {
  const [q, setQ] = useState("");
  const [emails, setEmails] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  useEffect(() => { load(); }, []);
  async function load() {
    const res = await searchEmails();
    setEmails(res);
  }
  async function onSearch() {
    const res = await searchEmails(q);
    setEmails(res);
  }
  async function onSuggest() {
    if (!selected) return;
    const r = await suggestReply(selected.body);
    alert("Suggested reply:\n\n" + r.suggestion);
  }
  return (
    <div style={{ padding: 20 }}>
      <h2>ReachInbox — Onebox (demo)</h2>
      <div>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="search..." />
        <button onClick={onSearch}>Search</button>
      </div>
      <div style={{ display: "flex", marginTop: 12 }}>
        <div style={{ width: 350 }}>
          <ul>
            {emails.map(e => (
              <li key={e.id} style={{ cursor: "pointer", marginBottom: 8 }} onClick={() => setSelected(e)}>
                <b>{e.subject}</b><div style={{ fontSize: 12 }}>{e.from} • {e.ai_label}</div>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginLeft: 20, flex: 1 }}>
          {selected ? (
            <>
              <h3>{selected.subject}</h3>
              <div><b>From:</b> {selected.from}</div>
              <div><b>Category:</b> {selected.ai_label}</div>
              <pre style={{ whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto" }}>{selected.body}</pre>
              <button onClick={onSuggest}>Get Suggested Reply</button>
            </>
          ) : <div>Select an email</div>}
        </div>
      </div>
    </div>
  );
}
