あと、 \_tabBarController.animation で　いつも \_tabBarController を animation にしていたのですが、
\_tabBarController.animation を利用するほうがいいといことにも気づきました。

はじめはこういうふうにしました

```dart
class RainbowColorTween extends Tween<Color> {
  final Rainbow _rb;

  /// Creates a [Color] tween.
  RainbowColorTween(List<Color> spectrum, {double rangeEnd = 2.0})
      : _rb = Rainbow(spectrum: spectrum, rangeStart: 0.0, rangeEnd: rangeEnd),
        super(begin: spectrum.first, end: spectrum.last);

  /// Returns the value this variable has at the given animation clock value.
  @override
  Color lerp(double t) => _rb[t];
}
```

note: gist dart
