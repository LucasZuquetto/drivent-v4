import bookingRepository from "@/repositories/booking-repository";
import { notFoundError, forbiddenError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import hotelRepository from "@/repositories/hotel-repository";

async function getBookingByUserId(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) {
    throw notFoundError();
  }
  return booking;
}

async function createBooking(userId: number, roomId: number) {
  await verifyBooking(userId);
  await verifyRoom(roomId, userId);

  const createBooking = await bookingRepository.createBooking(userId, roomId);
  return createBooking;
}

async function verifyBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status === "RESERVED") {
    throw forbiddenError();
  }
}

async function verifyRoom(roomId: number, userId: number) {
  const room = await hotelRepository.findRoomByRoomId(roomId);
  if (!room) {
    throw notFoundError();
  }
  const bookingAlreadyExists = await bookingRepository.findBookingByUserId(userId);
  if (bookingAlreadyExists) {
    throw forbiddenError();
  }
  const roomBookings = await bookingRepository.findBookingsByRoomId(roomId);
  if (roomBookings.length === room.capacity) {
    throw forbiddenError();
  }
}

async function verifyUserBooking(userId: number) {
  const userBooking = await bookingRepository.findBookingByUserId(userId);

  if (!userBooking) {
    throw forbiddenError();
  }
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
  await verifyBooking(userId);
  await verifyRoom(roomId, userId);
  await verifyUserBooking(userId);

  const booking = await bookingRepository.updateBooking(roomId, bookingId);
  return booking;
}

const bookingService = {
  getBookingByUserId,
  createBooking,
  updateBooking,
};

export default bookingService;
