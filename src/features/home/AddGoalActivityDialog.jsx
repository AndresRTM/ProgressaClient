import { useState } from "react";
import Sheet from "../../components/Sheet";

export default function AddGoalActivityDialog({ onSave, onClose }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = data.get("activityName").trim();

    setError("");
    setSaving(true);

    try {
      await onSave(name);
    } catch {
      setError("Det gick inte att lägga till aktiviteten. Försök igen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet title="Add activity type" onClose={onClose}>
      <form className="home-form" onSubmit={submit}>
        <label>
          Activity name
          <input name="activityName" maxLength={50} pattern=".*\S.*" required />
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={saving}>
          {saving ? "Adding…" : "Add activity"}
        </button>
      </form>
    </Sheet>
  );
}