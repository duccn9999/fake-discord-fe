export function Modal({ message, show, onClose, onConfirm  }) {
    if (!show) return null; // Don't render if show is false
  
    return (
      <div
        id="overlay"
        style={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 10,
          position: "fixed",
          top: 0,
          left: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose} // Close when clicking outside the modal
      >
        <div
          id="content"
          style={{
            width: "300px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <h1 className="textInverse" style={{ textAlign: "center" }}>
            {message}
          </h1>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button className="btn bgDanger textFaded" onClick={onConfirm}>
              Yes
            </button>
            <button className="btn bgFaded" onClick={onClose} style={{ marginLeft: "10px" }}>
              No
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default Modal;
  