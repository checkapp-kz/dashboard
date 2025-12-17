'use client';

import { useMemo } from 'react';
import { useCheckupTemplates } from './use-checkup-templates';
import { DEFAULT_TEST_TYPES } from '@/lib/types';

export interface TestTypeItem {
    value: string;
    label: string;
}

/**
 * Хук для получения динамического списка типов тестов
 * Основан на активных CheckupTemplates из API
 */
export function useTestTypes() {
    const { data: templates, isLoading, error } = useCheckupTemplates();

    const testTypes = useMemo<TestTypeItem[]>(() => {
        if (!templates || templates.length === 0) {
            return DEFAULT_TEST_TYPES;
        }

        return templates.map((template) => ({
            value: template.testKey,
            label: `${template.carouselTitle} - ${template.carouselSubtitle}`,
        }));
    }, [templates]);

    return {
        testTypes,
        isLoading,
        error,
    };
}

/**
 * Получить label для testType
 */
export function getTestTypeLabel(testTypes: TestTypeItem[], testKey: string): string {
    const found = testTypes.find((t) => t.value === testKey);
    if (found) return found.label;

    // Fallback в legacy
    const legacy = DEFAULT_TEST_TYPES.find((t) => t.value === testKey);
    if (legacy) return legacy.label;

    // Capitalize testKey как fallback
    return testKey.charAt(0).toUpperCase() + testKey.slice(1).replace(/-/g, ' ');
}
