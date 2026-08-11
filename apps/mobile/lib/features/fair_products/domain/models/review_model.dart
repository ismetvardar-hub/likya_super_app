class SellerReviewModel {
  final String id;
  final String reviewerName;
  final double rating;
  final String comment;
  final DateTime date;
  final bool isVerifiedBuyer;

  SellerReviewModel({
    required this.id,
    required this.reviewerName,
    required this.rating,
    required this.comment,
    required this.date,
    this.isVerifiedBuyer = true,
  });
}
