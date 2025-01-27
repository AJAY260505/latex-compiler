// client/src/components/ErrorPanel.tsx
export const ErrorPanel = ({ errors }) => (
    <div className="error-panel">
      <h3>Compilation Errors:</h3>
      {errors.map((error, i) => (
        <div key={i} className="error-item">
          {error.line && <div>Line {error.line}:</div>}
          <code>{error.message}</code>
        </div>
      ))}
    </div>
  );