import { mount } from '@vue/test-utils';
import MismatchesTable from '@/Components/MismatchesTable.vue';
import MismatchRow from '@/Components/MismatchRow.vue';

import { ReviewDecision } from '@/types/Mismatch.ts';

describe('MismatchesTable.vue', () => {
    it('accepts a mismatches property', () => {
        const mismatches = [
            {
                id: 123,
                property_id: 'P123',
                wikidata_value: 'Some value',
                external_value: 'Another Value',
                import_meta: {
                    user: {
                        username: 'some_user_name'
                    },
                    created_at: '2021-09-23'
                },
            }
        ];

        const wrapper = mount(MismatchesTable, {
            propsData: { mismatches },
            mocks: {
                // Mock the banana-i18n plugin dependency
                $i18n: key => key
            }
        });

        const rows = wrapper.findAllComponents(MismatchRow);

        expect( wrapper.props().mismatches ).toBe( mismatches );
        expect(rows.length).toBe(mismatches.length);

        rows.wrappers.forEach(row => {
            expect(mismatches).toContain(row.props().mismatch);
        });
    });

    it('emits update:mismatches on update:decision', async () => {
        const mismatch = {
            id: 123,
            property_id: 'P123',
            wikidata_value: 'Some value',
            external_value: 'Another Value',
            review_status: 'pending',
            import_meta: {
                user: {
                    username: 'some_user_name'
                },
                created_at: '2021-09-23'
            },
        }

        const mismatches = [mismatch];

        const wrapper = mount(MismatchesTable, {
            propsData: { mismatches },
            mocks: {
                // Mock the banana-i18n plugin dependency
                $i18n: key => key
            }
        });

        const rows = wrapper.findAllComponents(MismatchRow);

        rows.at(0).vm.$emit('update:decision', ReviewDecision.Wikidata);

        // Wait for the event queue to be processed.
        await wrapper.vm.$nextTick();

        const emittedMismatchesUpdate = wrapper.emitted()['update:mismatches'];

        // assert event has been emitted
        expect(emittedMismatchesUpdate).toBeTruthy();

        // assert only one decision was emitted
        expect(emittedMismatchesUpdate.length).toBe(1);

        // assert correct payload
        expect(emittedMismatchesUpdate[0]).toEqual([[{
            ...mismatch,
            review_status: ReviewDecision.Wikidata
        }]]);
    });
})
