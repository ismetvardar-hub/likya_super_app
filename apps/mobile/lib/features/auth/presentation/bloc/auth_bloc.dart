import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/auth_repository.dart';
import '../../domain/models/user_model.dart';

// EVENTS
abstract class AuthEvent {}

class CheckAuthStatusEvent extends AuthEvent {}

class LoginWithEmailEvent extends AuthEvent {
  final String email;
  final String password;
  LoginWithEmailEvent({required this.email, required this.password});
}

class RegisterWithEmailEvent extends AuthEvent {
  final String email;
  final String password;
  final String fullName;
  RegisterWithEmailEvent({required this.email, required this.password, required this.fullName});
}

class SignOutEvent extends AuthEvent {}

// STATES
abstract class AuthState {}

class AuthInitialState extends AuthState {}

class AuthLoadingState extends AuthState {}

class AuthenticatedState extends AuthState {
  final UserModel user;
  AuthenticatedState({required this.user});
}

class UnauthenticatedState extends AuthState {}

class AuthErrorState extends AuthState {
  final String message;
  AuthErrorState({required this.message});
}

// BLOC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthInitialState()) {
    on<CheckAuthStatusEvent>((event, emit) async {
      emit(AuthLoadingState());
      try {
        final profile = await authRepository.getCurrentUserProfile();
        if (profile != null) {
          emit(AuthenticatedState(user: profile));
        } else {
          emit(UnauthenticatedState());
        }
      } catch (e) {
        emit(UnauthenticatedState());
      }
    });

    on<LoginWithEmailEvent>((event, emit) async {
      emit(AuthLoadingState());
      try {
        await authRepository.signInWithEmail(
          email: event.email,
          password: event.password,
        );
        final profile = await authRepository.getCurrentUserProfile();
        if (profile != null) {
          emit(AuthenticatedState(user: profile));
        } else {
          emit(UnauthenticatedState());
        }
      } catch (e) {
        emit(AuthErrorState(message: e.toString()));
      }
    });

    on<RegisterWithEmailEvent>((event, emit) async {
      emit(AuthLoadingState());
      try {
        await authRepository.signUpWithEmail(
          email: event.email,
          password: event.password,
          fullName: event.fullName,
        );
        emit(UnauthenticatedState());
      } catch (e) {
        emit(AuthErrorState(message: e.toString()));
      }
    });

    on<SignOutEvent>((event, emit) async {
      emit(AuthLoadingState());
      await authRepository.signOut();
      emit(UnauthenticatedState());
    });
  }
}
