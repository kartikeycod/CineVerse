import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./components/homepage/HomePage";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import MovieDetail from "./components/movie/MovieDetails";
import UserProfile from "./components/profile/UserProfile";
import TheaterList from "./components/theater/TheaterList";
import TheaterMovies from "./components/movie/TheaterMovies";
import ShowList from "./components/show/ShowList";
import SeatSelection from "./components/seat/SeatSelection";
import BookingSuccess from "./components/booking/BookingSuccess";
import MyBookings from "./components/booking/MyBookings";




import PaymentSuccess from "./components/payment/PaymentSuccess";
import TicketView from "./components/ticket/TicketView";






const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/seats/:showId" element={<SeatSelection />} />
        <Route path="/booking-success/:bookingId" element={<BookingSuccess />} />

        {/* BOOKING FLOW */}
        <Route path="/theaters" element={<TheaterList />} />
        <Route
          path="/theater/:theaterId/movies"
          element={<TheaterMovies />}
        />
        <Route
          path="/theater/:theaterId/movie/:movieId/shows"
          element={<ShowList />}
        />
        <Route path="/payment-success/:bookingId" element={<PaymentSuccess />} />
<Route path="/ticket/:bookingId" element={<TicketView />} />
<Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
