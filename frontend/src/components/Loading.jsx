import React from "react";

const Loading = () => {
  // Inline styles for Light Theme
  const styles = {
    container: {
      height: "100vh",
      backgroundColor: "#f8f9fa",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    },
    backgroundPattern: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      opacity: 0.8,
      zIndex: 0,
    },
    content: {
      textAlign: "center",
      position: "relative",
      zIndex: 1,
      maxWidth: "500px",
      padding: "2rem",
    },
    logo: {
      marginBottom: "2rem",
      animation: "float 4s ease-in-out infinite",
    },
    heading: {
      fontFamily: '"Outfit", sans-serif',
      color: "#212529",
      marginBottom: "0.5rem",
      fontSize: "2.5rem",
      fontWeight: "800",
      letterSpacing: "1px",
    },
    subtitle: {
      fontFamily: '"Inter", sans-serif',
      background: "linear-gradient(135deg, #000000 0%, #434343 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "2.5rem",
      fontSize: "1.2rem",
      fontWeight: "600",
    },
    text: {
      color: "#6c757d", // text-secondary equiv
      marginBottom: "2rem",
      fontSize: "1rem",
    },
    loader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "2rem",
      height: "40px",
    },
    dot: {
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      margin: "0 8px",
      animation: "pulseGlow 1.5s infinite ease-in-out",
    },
    dot1: {
      backgroundColor: "#212529",
      boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      animationDelay: "0s",
    },
    dot2: {
      backgroundColor: "#495057",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      animationDelay: "0.2s",
    },
    dot3: {
      backgroundColor: "#f43f5e",
      boxShadow: "0 0 10px #f43f5e",
      animationDelay: "0.4s",
    },
    progressContainer: {
      width: "100%",
      height: "4px",
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      margin: "0 auto 2.5rem",
      borderRadius: "2px",
      overflow: "hidden",
    },
    progressBar: {
      height: "100%",
      width: "45%",
      background: "linear-gradient(90deg, #212529, #495057)",
      animation: "progressAnimation 2s ease-in-out infinite",
      borderRadius: "2px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    },
    tipsContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(10px)",
      borderRadius: "16px",
      padding: "1.5rem",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.05)",
      marginTop: "1rem",
      border: "1px solid rgba(0, 0, 0, 0.08)",
    },
    tipHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1rem",
      color: "#212529",
      fontWeight: "bold",
    },
    tipIcon: {
      marginRight: "0.5rem",
      fontSize: "1.2rem",
    },
    tipText: {
      color: "#6c757d",
      fontSize: "0.95rem",
      lineHeight: "1.6",
    },
    keyframes: `
      @keyframes pulseGlow {
        0%, 100% { transform: scale(0.8); opacity: 0.5; } 
        50% { transform: scale(1.2); opacity: 1; filter: brightness(1.2); }
      }
      @keyframes progressAnimation {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.4)); }
        50% { transform: translateY(-10px); filter: drop-shadow(0 0 25px rgba(6, 182, 212, 0.6)); }
      }
    `,
  };

  // Fun loading messages
  const loadingMessages = [
    "Establishing neural link...",
    "Synthesizing digital constructs...",
    "Calibrating flux capacitors...",
    "Optimizing reading experience...",
    "Rendering infinite possibilities...",
  ];

  // Random tip messages
  const tipMessages = [
    "Switching to dark mode reduces eye strain during late-night reading.",
    "Engage with authors by leaving thoughtful comments on their posts.",
    "Explore categories you've never read before. Discover something new.",
    "Our sleek new interface is optimized for speed and immersion.",
    "Bookmark your favorite posts so you never lose them.",
  ];

  // Select random messages
  const randomMessage =
    loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  const randomTip = tipMessages[Math.floor(Math.random() * tipMessages.length)];

  return (
    <div style={styles.container}>
      {/* Add keyframes to style tag in head */}
      <style>{styles.keyframes}</style>

      {/* Background pattern */}
      <div style={styles.backgroundPattern}></div>

      {/* Main content */}
      <div style={styles.content}>
        {/* Logo with animation */}
        <div style={styles.logo}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
              fill="#ffffff"
              stroke="#212529"
              strokeWidth="2"
            />
            <path
              d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z"
              fill="#495057"
              opacity="0.8"
            />
            <path
              d="M12 10C11.45 10 11 10.45 11 11C11 11.55 11.45 12 12 12C12.55 12 13 11.55 13 11C13 10.45 12.55 10 12 10Z"
              fill="#fff"
            />
          </svg>
        </div>

        {/* Heading with your brand font */}
        <h1 style={styles.heading}>BlogHub</h1>
        <p style={styles.subtitle}>Curating knowledge, expanding horizons</p>

        {/* Loading message */}
        <p style={styles.text}>{randomMessage}</p>

        {/* Bouncing dots loader */}
        <div style={styles.loader}>
          <div style={{ ...styles.dot, ...styles.dot1 }}></div>
          <div style={{ ...styles.dot, ...styles.dot2 }}></div>
          <div style={{ ...styles.dot, ...styles.dot3 }}></div>
        </div>

        {/* Animated progress bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}></div>
        </div>

        {/* Tips section */}
        <div style={styles.tipsContainer}>
          <div style={styles.tipHeader}>
            <i className="fas fa-lightbulb" style={styles.tipIcon}></i>
            <span>Did You Know?</span>
          </div>
          <p style={styles.tipText}>{randomTip}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
