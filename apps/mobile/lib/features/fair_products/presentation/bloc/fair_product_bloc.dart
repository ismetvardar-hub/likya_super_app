import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/fair_product_repository.dart';
import '../../domain/models/fair_product_model.dart';

// EVENTS
abstract class FairProductEvent {}

class LoadFairProductsEvent extends FairProductEvent {}

class CreateFairProductEvent extends FairProductEvent {
  final FairProductModel product;
  CreateFairProductEvent(this.product);
}

class _ProductsUpdatedEvent extends FairProductEvent {
  final List<FairProductModel> products;
  _ProductsUpdatedEvent(this.products);
}

// STATES
abstract class FairProductState {}

class FairProductLoadingState extends FairProductState {}

class FairProductLoadedState extends FairProductState {
  final List<FairProductModel> products;
  FairProductLoadedState(this.products);
}

class FairProductErrorState extends FairProductState {
  final String message;
  FairProductErrorState(this.message);
}

// BLOC
class FairProductBloc extends Bloc<FairProductEvent, FairProductState> {
  final FairProductRepository repository;
  StreamSubscription? _subscription;

  FairProductBloc({required this.repository}) : super(FairProductLoadingState()) {
    on<LoadFairProductsEvent>((event, emit) async {
      emit(FairProductLoadingState());
      _subscription?.cancel();
      try {
        _subscription = repository.streamActiveProducts().listen(
          (products) => add(_ProductsUpdatedEvent(products)),
          onError: (e) => emit(FairProductErrorState(e.toString())),
        );
      } catch (e) {
        emit(FairProductErrorState(e.toString()));
      }
    });

    on<_ProductsUpdatedEvent>((event, emit) {
      emit(FairProductLoadedState(event.products));
    });

    on<CreateFairProductEvent>((event, emit) async {
      try {
        await repository.createProduct(event.product);
      } catch (e) {
        emit(FairProductErrorState(e.toString()));
      }
    });
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
