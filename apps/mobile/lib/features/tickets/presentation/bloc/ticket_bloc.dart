import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/ticket_repository.dart';
import '../../domain/models/ticket_model.dart';

// EVENTS
abstract class TicketEvent {}

class LoadUserTicketsEvent extends TicketEvent {
  final String userId;
  LoadUserTicketsEvent(this.userId);
}

class PurchaseTicketRequestedEvent extends TicketEvent {
  final String eventId;
  final String userId;
  final String qrCode;
  PurchaseTicketRequestedEvent({required this.eventId, required this.userId, required this.qrCode});
}

class _TicketsUpdatedEvent extends TicketEvent {
  final List<TicketModel> tickets;
  _TicketsUpdatedEvent(this.tickets);
}

// STATES
abstract class TicketState {}

class TicketLoadingState extends TicketState {}

class TicketLoadedState extends TicketState {
  final List<TicketModel> tickets;
  TicketLoadedState(this.tickets);
}

class TicketErrorState extends TicketState {
  final String message;
  TicketErrorState(this.message);
}

// BLOC
class TicketBloc extends Bloc<TicketEvent, TicketState> {
  final TicketRepository repository;
  StreamSubscription? _subscription;

  TicketBloc({required this.repository}) : super(TicketLoadingState()) {
    on<LoadUserTicketsEvent>((event, emit) async {
      emit(TicketLoadingState());
      _subscription?.cancel();
      try {
        _subscription = repository.streamUserTickets(event.userId).listen(
          (tickets) => add(_TicketsUpdatedEvent(tickets)),
          onError: (e) => emit(TicketErrorState(e.toString())),
        );
      } catch (e) {
        emit(TicketErrorState(e.toString()));
      }
    });

    on<_TicketsUpdatedEvent>((event, emit) {
      emit(TicketLoadedState(event.tickets));
    });

    on<PurchaseTicketRequestedEvent>((event, emit) async {
      try {
        await repository.purchaseTicket(
          eventId: event.eventId,
          userId: event.userId,
          qrCode: event.qrCode,
        );
      } catch (e) {
        emit(TicketErrorState(e.toString()));
      }
    });
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
