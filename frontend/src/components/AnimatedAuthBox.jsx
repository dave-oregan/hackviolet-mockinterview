import { motion, AnimatePresence } from 'framer-motion';

const AnimatedAuthBox = ({ isLogin, children }) => {
  return (
    <motion.div
      layout // [1] Key to smooth resizing
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { duration: 0.4, ease: "easeOut" }, // [2] Controls resize speed
        opacity: { duration: 0.2 }
      }}
      className="auth-container"
      style={{
        background: 'rgba(33, 36, 44, 0.95)',
        borderRadius: '16px',
        padding: '2rem',
        overflow: 'hidden', // [3] Keeps content inside during resize
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimatedAuthBox;