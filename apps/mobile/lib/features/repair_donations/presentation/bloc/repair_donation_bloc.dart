import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/repair_donation_repository.dart';
import '../../domain/models/repair_donation_model.dart';

// EVENTS
abstract class RepairDonationEvent {}

class LoadDonorDonationsEvent extends RepairDonationEvent {
  final String donorId;
  LoadDonorDonationsEvent(this.donorId);
}

class CreateRepairDonationRequestedEvent extends RepairDonationEvent {
  final RepairDonationModel donation;
  CreateRepairDonationRequestedEvent(this.donation);
}

// STATES
abstract class RepairDonationState {}

class RepairDonationLoadingState extends RepairDonationState {}

class RepairDonationLoadedState extends RepairDonationState {
  final List<RepairDonationModel> donations;
  RepairDonationLoadedState(this.donations);
}

class RepairDonationErrorState extends RepairDonationState {
  final String message;
  RepairDonationErrorState(this.message);
}

// BLOC
class RepairDonationBloc extends Bloc<RepairDonationEvent, RepairDonationState> {
  final RepairDonationRepository repository;

  RepairDonationBloc({required this.repository}) : super(RepairDonationLoadingState()) {
    on<LoadDonorDonationsEvent>((event, emit) async {
      emit(RepairDonationLoadingState());
      try {
        final items = await repository.getDonorDonations(event.donorId);
        emit(RepairDonationLoadedState(items));
      } catch (e) {
        emit(RepairDonationErrorState(e.toString()));
      }
    });

    on<CreateRepairDonationRequestedEvent>((event, emit) async {
      try {
        await repository.createRepairDonation(event.donation);
        add(LoadDonorDonationsEvent(event.donation.donorId));
      } catch (e) {
        emit(RepairDonationErrorState(e.toString()));
      }
    });
  }
}
