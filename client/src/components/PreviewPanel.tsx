// client/src/components/PreviewPanel.tsx
export const PreviewPanel = ({ pdfUrl, loading }) => (
    <div className="preview-panel">
      {loading ? (
        <div className="loading-indicator">
          <Spinner />
          <p>Generating PDF...</p>
        </div>
      ) : (
        pdfUrl && <iframe src={pdfUrl} />
      )}
      
      {!loading && pdfUrl && (
        <a 
          href={pdfUrl} 
          download="document.pdf"
          className="download-button"
        >
          Download PDF
        </a>
      )}
    </div>
  );