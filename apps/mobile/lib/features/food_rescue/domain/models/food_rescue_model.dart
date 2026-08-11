class FoodRescueMealModel {
  final String id;
  final String title;
  final String cafeteriaName;
  final double originalPrice;
  final double discountedPrice;
  final int availablePortions;
  final bool isVegan;
  final bool isGlutenFree;
  final String pickupWindow;

  FoodRescueMealModel({
    required this.id,
    required this.title,
    required this.cafeteriaName,
    required this.originalPrice,
    required this.discountedPrice,
    required this.availablePortions,
    this.isVegan = false,
    this.isGlutenFree = false,
    required this.pickupWindow,
  });
}
