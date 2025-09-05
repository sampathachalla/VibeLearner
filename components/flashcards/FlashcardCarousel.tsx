import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';
import FlashcardCard, { FlashcardProps } from './FlashcardCard';
import { useThemeColors } from '../../hooks/useThemeColors';

export type FlashcardCarouselProps = {
  cards: FlashcardProps[];
};

export type FlashcardCarouselHandle = { next: () => void };

const FlashcardCarousel = ({ cards }: FlashcardCarouselProps, ref: React.ForwardedRef<FlashcardCarouselHandle>) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const scrollRef = useRef<any>(null);
  const colors = useThemeColors();

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
    setIndex(Math.min(Math.max(idx, 0), cards.length - 1));
  };

  const indicators = useMemo(() => Array.from({ length: cards.length }), [cards.length]);

  const doNext = () => {
    if (!cards.length || !pageWidth) return;
    const next = (index + 1) % cards.length;
    scrollRef.current?.scrollTo({ x: next * pageWidth, animated: true });
    setIndex(next);
  };

  useImperativeHandle(ref, () => ({ next: doNext }), [cards.length, pageWidth, index]);

  return (
    <View style={{ position: 'relative' }}>
      <Animated.ScrollView
        ref={scrollRef as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
      >
        {cards.map((c, i) => (
          <View key={i} style={{ width: pageWidth || 320, alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
            <View style={{ maxWidth: 420, width: '92%' }}>
              <FlashcardCard term={c.term} definition={c.definition} />
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.dotsWrap}>
        {indicators.map((_, i) => {
          const w = pageWidth || 320;
          const inputRange = [ (i - 1) * w, i * w, (i + 1) * w ];
          const scale = scrollX.interpolate({ inputRange, outputRange: [1, 1.3, 1], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
          return <Animated.View key={i} style={[styles.dot, { backgroundColor: colors.primary, transform: [{ scale }], opacity }]} />;
        })}
      </View>

      <Text style={[styles.counter, { color: colors.textSecondary }]}>{cards.length ? index + 1 : 0}/{cards.length}</Text>
    </View>
  );
};

export default forwardRef<FlashcardCarouselHandle, FlashcardCarouselProps>(FlashcardCarousel);

const styles = StyleSheet.create({
  dotsWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7F8CFF' },
  counter: { color: '#8A8FA0', textAlign: 'center', marginTop: 6 },
});
