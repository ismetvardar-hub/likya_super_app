import 'package:supabase_flutter/supabase_flutter.dart';
import '../../domain/models/fair_product_model.dart';
import '../../../../core/services/supabase_service.dart';

class FairProductRepository {
  final SupabaseClient _client = SupabaseService.client;

  Future<List<FairProductModel>> getActiveProducts() async {
    final response = await _client
        .from('fair_products')
        .select()
        .eq('status', 'active')
        .order('created_at', ascending: false);

    return (response as List)
        .map((json) => FairProductModel.fromJson(json))
        .toList();
  }

  // Supabase Realtime Stream aboneliği
  Stream<List<FairProductModel>> streamActiveProducts() {
    return _client
        .from('fair_products')
        .stream(primaryKey: ['id'])
        .eq('status', 'active')
        .order('created_at', ascending: false)
        .map((data) => data.map((json) => FairProductModel.fromJson(json)).toList());
  }

  Future<FairProductModel> createProduct(FairProductModel product) async {
    final response = await _client
        .from('fair_products')
        .insert(product.toJson())
        .select()
        .single();

    return FairProductModel.fromJson(response);
  }
}
