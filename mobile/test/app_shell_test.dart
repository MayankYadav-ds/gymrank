import 'package:flutter_test/flutter_test.dart';
import 'package:gymrank/app/gymrank_app.dart';

void main() {
  testWidgets('shows GymRank foundation shell', (tester) async {
    await tester.pumpWidget(const GymRankApp());

    expect(find.text('GymRank'), findsOneWidget);
    expect(find.text('Competitive strength progress platform'), findsOneWidget);
  });
}
