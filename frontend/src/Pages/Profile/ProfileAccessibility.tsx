import React, { useState } from "react";
import { useTheme } from "../../helpers/ChangeStyle";

function ProfileAccessibility() {
  const { fontSize, cursor, dark, setFontSize, setCursor, setDark } = useTheme();

  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [localCursor, setLocalCursor] = useState(cursor);
  const [localDark, setLocalDark] = useState(dark);
  const [confirmationMsg, setConfirmationMsg] = useState("");

  function handleChangeStyle() {
    setFontSize(localFontSize);
    setCursor(localCursor);
    setDark(localDark);
    setConfirmationMsg("Vos paramètres d'accessibilité ont été appliqués.");
    setTimeout(() => setConfirmationMsg(""), 3000);
  }

  return (
    <section
      className="accessibility-form"
      aria-labelledby="accessibility-title"
    >
      <h3 id="accessibility-title">Paramètres d'accessibilité</h3>
      <p className="text-muted">
        Personnalisez l’affichage du site pour améliorer votre confort visuel.
      </p>

      {/* Taille de police */}
      <div className="mb-3">
        <label htmlFor="font-size-select" className="form-label">
          Taille de police
        </label>
        <select
          id="font-size-select"
          className="form-select"
          aria-label="Changer la taille de la police"
          value={localFontSize}
          onChange={(e) => setLocalFontSize(e.target.value)}
        >
          <option value="normal-class">Normal</option>
          <option value="medium-class">Moyen</option>
          <option value="large-class">Grand</option>
        </select>
      </div>

      {/* Curseur */}
      <div className="form-check form-switch mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          id="cursor-switch"
          role="switch"
          aria-checked={localCursor}
          checked={localCursor}
          onChange={(e) => setLocalCursor(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="cursor-switch">
          Activer le curseur large
        </label>
      </div>

      {/* Mode sombre */}
      <div className="form-check form-switch mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="darkmode-switch"
          role="switch"
          aria-checked={localDark}
          checked={localDark}
          onChange={(e) => setLocalDark(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="darkmode-switch">
          Activer le mode sombre
        </label>
      </div>

      {/* Bouton d’application */}
      <button
        className="btn btn-primary"
        onClick={handleChangeStyle}
        aria-label="Appliquer les paramètres d'accessibilité"
      >
        Valider
      </button>

      {/* Zone de confirmation (aria-live pour lecteur d’écran) */}
      <div
        className="visually-hidden"
        role="status"
        aria-live="polite"
      >
        {confirmationMsg}
      </div>
    </section>
  );
}

export default ProfileAccessibility;