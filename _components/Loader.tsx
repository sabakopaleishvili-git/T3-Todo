import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border border-t-2 border-white"></div>
    </div>
  );
};

export default Loader;
