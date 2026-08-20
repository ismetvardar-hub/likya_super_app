/* ============================================================================
   EXTREMES SMART INSOLE — ADC Gürültü Filtre Kütüphanesi (Adım 17)
   - EMA (Exponential Moving Average): hızlı yanıt + kontak paraziti azaltma
   - Low-Pass (tek kutuplu IIR): ADC jitter/dithering yumuşatma
   100 Hz örnekleme hattına uygun katsayılarla önceden ayarlanır.
   ========================================================================= */

#ifndef EXTREMES_ADC_FILTER_H
#define EXTREMES_ADC_FILTER_H

#include <Arduino.h>

// ── EMA Filtre ──
class EMAFilter {
public:
  explicit EMAFilter(float alpha = 0.2f) : m_alpha(alpha), m_value(-1.0f) {}
  float filter(float input) {
    if (m_value < 0.0f) { m_value = input; return m_value; }
    m_value = m_alpha * input + (1.0f - m_alpha) * m_value;
    return m_value;
  }
  float value() const { return m_value; }
  void reset() { m_value = -1.0f; }
private:
  float m_alpha;
  float m_value;
};

// ── Tek Kutuplu Low-Pass (IIR) ──
class LowPassFilter {
public:
  explicit LowPassFilter(float alpha = 0.1f) : m_alpha(alpha), m_value(0.0f) {}
  float filter(float input) {
    m_value = m_alpha * input + (1.0f - m_alpha) * m_value;
    return m_value;
  }
  float value() const { return m_value; }
  void reset() { m_value = 0.0f; }
private:
  float m_alpha;
  float m_value;
};

// ── Pencereli Hareketli Ortalama (windowed moving average) ──
template <size_t WINDOW>
class MovingAverageFilter {
public:
  MovingAverageFilter() : m_sum(0.0f), m_count(0), m_idx(0) {
    for (size_t i = 0; i < WINDOW; i++) m_buf[i] = 0.0f;
  }
  float filter(float input) {
    if (m_count < WINDOW) m_count++;
    m_sum -= m_buf[m_idx];
    m_buf[m_idx] = input;
    m_sum += input;
    m_idx = (m_idx + 1) % WINDOW;
    return m_sum / (float)m_count;
  }
  void reset() {
    m_sum = 0.0f; m_count = 0; m_idx = 0;
    for (size_t i = 0; i < WINDOW; i++) m_buf[i] = 0.0f;
  }
private:
  float m_buf[WINDOW];
  float m_sum;
  size_t m_count;
  size_t m_idx;
};

#endif // EXTREMES_ADC_FILTER_H
