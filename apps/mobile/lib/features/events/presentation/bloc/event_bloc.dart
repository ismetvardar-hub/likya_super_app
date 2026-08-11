import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/event_repository.dart';
import '../../domain/models/event_model.dart';

// EVENTS
abstract class EventEvent {}

class LoadEventsEvent extends EventEvent {}

class CreateEventRequestedEvent extends EventEvent {
  final EventModel event;
  CreateEventRequestedEvent(this.event);
}

// STATES
abstract class EventState {}

class EventLoadingState extends EventState {}

class EventLoadedState extends EventState {
  final List<EventModel> events;
  EventLoadedState(this.events);
}

class EventErrorState extends EventState {
  final String message;
  EventErrorState(this.message);
}

// BLOC
class EventBloc extends Bloc<EventEvent, EventState> {
  final EventRepository repository;

  EventBloc({required this.repository}) : super(EventLoadingState()) {
    on<LoadEventsEvent>((event, emit) async {
      emit(EventLoadingState());
      try {
        final events = await repository.getPublishedEvents();
        emit(EventLoadedState(events));
      } catch (e) {
        emit(EventErrorState(e.toString()));
      }
    });

    on<CreateEventRequestedEvent>((event, emit) async {
      try {
        await repository.createEvent(event.event);
        add(LoadEventsEvent());
      } catch (e) {
        emit(EventErrorState(e.toString()));
      }
    });
  }
}
