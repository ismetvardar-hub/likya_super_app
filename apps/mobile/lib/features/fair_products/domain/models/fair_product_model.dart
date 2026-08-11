class FairProductModel {
  final String id;
  final String sellerId;
  final String name;
  final String? description;
  final double price;
  final int stockQuantity;
  final String category;
  final String status;
  final String? imageUrl;
  final DateTime createdAt;

  FairProductModel({
    required this.id,
    required this.sellerId,
    required this.name,
    this.description,
    required this.price,
    required this.stockQuantity,
    required this.category,
    required this.status,
    this.imageUrl,
    required this.createdAt,
  });

  factory FairProductModel.fromJson(Map<String, dynamic> json) {
    return FairProductModel(
      id: json['id'] as String,
      sellerId: json['seller_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      stockQuantity: json['stock_quantity'] as int? ?? 0,
      category: json['category'] as String,
      status: json['status'] as String? ?? 'active',
      imageUrl: json['image_url'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'seller_id': sellerId,
      'name': name,
      'description': description,
      'price': price,
      'stock_quantity': stockQuantity,
      'category': category,
      'status': status,
      'image_url': imageUrl,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
