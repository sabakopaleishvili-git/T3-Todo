import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200/40 border-t-blue-100"></div>
    </div>
  );
};

export default Loader;
