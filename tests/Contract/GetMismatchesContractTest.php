<?php

namespace Tests\Contract;

use App\Http\Controllers\MismatchController;
use App\Models\ImportMeta;
use App\Models\Mismatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Kirschbaum\OpenApiValidator\ValidatesOpenApiSpec;

class GetMismatchesContractTest extends TestCase
{
    use RefreshDatabase, WithFaker, ValidatesOpenApiSpec;

    private const MISMATCH_ROUTE = 'api/' . MismatchController::RESOURCE_NAME;

    /**
     * Contract test for the /api/mismatches endpoint
     *
     *  @return void
     */
    public function test_mismatches_contract()
    {
        $mismatches = Mismatch::factory(2)
            ->for(
                ImportMeta::factory()->for(
                    User::factory()->uploader()
                )->create()
            )->create();

        $item_ids = $mismatches->map(
            function ($mismatch) {
                return $mismatch->item_id;
            }
        );

        $this->getJson(self::MISMATCH_ROUTE . '?ids=' . $item_ids->join('|'))
            ->assertSuccessful();
    }

    public function test_mismatches_contract_nothing_found()
    {
        $this->getJson(self::MISMATCH_ROUTE . '?ids=Q42')
            ->assertSuccessful();
    }

    public function test_mismatches_contract_invalid_request()
    {
        $this->getJson(self::MISMATCH_ROUTE . '?ids=L123')
            ->assertStatus(422);
    }
}
