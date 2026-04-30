import React from "react";
import skeleton from "../assets/images/skeletonLight.png";

export const SingleMovieCardSkeleton = () => (
  <div className="relative animate-pulse">
    <div className="flex items-center justify-center aspect-[9/13.5] object-cover w-full bg-bgColorSecondary rounded-2xl">
      <img
        src={skeleton}
        alt="skeletonloadingplaceholder"
        className="aspect-[9/13.5] object-cover max-w-full bg-bgColorSecondary rounded-2xl"
      />
    </div>
    <div className="mt-1 bottom-3 left-3 right-3">
      <p className="w-2/3 h-4 bg-bgColorSecondary rounded-full"></p>
      <div className="flex items-center justify-between mt-1 uppercase text-xs md:text-sm">
        <p className="w-10 h-4 bg-bgColorSecondary rounded-full"></p>
        <p className="w-8 h-5 bg-bgColorSecondary rounded-full"></p>
      </div>
    </div>
    <div className="absolute top-5 left-3 backdrop-blur-md bg-bgColor/40 w-10 h-6 rounded-full"></div>
    <div className="absolute bottom-16 right-3 backdrop-blur-md bg-bgColor/40 w-16 h-6 rounded-full"></div>
  </div>
);

const MovieCardSkeleton = ({ count = 19 }) => {
  return (
    <div className="grid gap-x-2 gap-y-6 grid-cols-2 md:grid-cols-3 bsmmd:grid-cols-4 lg:grid-cols-5 blgxl:grid-cols-6 xl:grid-cols-7">
      {[...Array(count)].map((_, index) => (
        <SingleMovieCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default MovieCardSkeleton;

