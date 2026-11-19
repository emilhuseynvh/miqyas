import { describe, expect, it } from 'vitest';
import { isJunkTitle } from './junk.js';

describe('isJunkTitle', () => {
  it.each([
    '19 noyabr üçün ulduz falı – Bu bürcləri gözlənilməz dəyişikliklər gözləyir',
    'Dörd BÜRCƏ xəyanət edənlər noyabrın sonunda cəzalandırılacaq',
    'Azərbaycan Mərkəzi Bankının valyuta məzənnələri (19.11.2026)',
    'Dolların, avro və rublun bugünkü məzənnəsi açıqlandı',
    'Baku Electronics-də Super Cümə vaxtıdır! - 70%-dək endirimlər sizi gözləyir!',
    'Bakıda namaz vaxtları – 19 noyabr',
    'Günün əsas xəbərləri',
  ])('flags %s', (title) => {
    expect(isJunkTitle(title)).toBe(true);
  });

  it.each([
    'Azərbaycan Prezidenti: 44 gün ərzində qardaş türk xalqı bizim yanımızda idi',
    'Elçin Babayev BDU-nun rektoru vəzifəsindən azad edilib',
    'Manatın məzənnəsi ilə bağlı Mərkəzi Bankdan açıqlama',
    'Kommunal xidmətlərə endirim tətbiq olunacaq',
  ])('keeps %s', (title) => {
    expect(isJunkTitle(title)).toBe(false);
  });
});
