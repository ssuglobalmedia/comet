<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    Button,
    ClickableTile,
    Column,
    DataTable,
    Grid,
    InlineNotification,
    Modal,
    Row,
    SkeletonText,
    Tag,
    Toggle,
  } from 'carbon-components-svelte';
  import type { CometError, CometResponse, Goods } from 'mirinae-comet';
  import { groupDisplayName } from '$lib/module/auth';
  import { browser } from '$app/environment';
  import { Add16, Delete16, Edit16, Need16 } from 'carbon-icons-svelte';
  import { userInfo } from '$lib/stores';
  import { isAccessible } from '$lib/module/auth';
  import AddGoodsModal from '../../../lib/components/molcule/module/rental/AddGoodsModal.svelte';
  import UpdateGoodsModal from '../../../lib/components/molcule/module/rental/UpdateGoodsModal.svelte';
  import RentModal from '../../../lib/components/molcule/module/rental/RentModal.svelte';
  import { apiGoodsDelete, apiGoodsQuery, apiGoodsReturn } from '$lib/api/module/rental';

  let allGoodies: Array<Goods> = undefined;

  $: categorizedGoods = (allGoodies ?? [])
    .filter((v) => (rentOnly && v.rentStatus !== undefined) || !rentOnly)
    .reduce(
      (map, obj) => ({
        ...map,
        [obj.category]: (map[obj.category] || []).concat(obj),
      }),
      {},
    );

  if (browser) {
    updateGoods();
  }

  let addGoodsModalOpen = false;
  let updateGoodsModalOpen = false;
  let rentModalOpen = false;
  let deleteModalOpen = false;
  let returnModalOpen = false;
  let targetGoods = undefined;
  let rentOnly = false;

  function openUpdateGoodsModal(row) {
    targetGoods = row;
    updateGoodsModalOpen = true;
  }

  function openDeleteGoodsModal(row) {
    targetGoods = row;
    deleteModalOpen = true;
  }

  function openReturnGoodsModal(row) {
    targetGoods = row;
    returnModalOpen = true;
  }

  function updateGoods() {
    allGoodies = undefined;
    apiGoodsQuery()
      .then((res) => {
        if (res.success === false)
          throw new Error(`Request error ${res.error.name}: ${res.error.message}`);
        if (res.success) allGoodies = res.result as Array<Goods>;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function deleteGoods() {
    deleteModalOpen = false;
    apiGoodsDelete(targetGoods.id)
      .then((res) => {
        if (res.success === false)
          throw new Error(`Request error ${res.error.name}: ${res.error.message}`);
        updateGoods();
      });
  }

  function returnGoods() {
    returnModalOpen = false;
    apiGoodsReturn({
      userId: targetGoods.rentStatus.userId,
      goodsId: targetGoods.id,
    })
      .then((res: CometResponse<{}, CometError>) => {
        if (res.success === false)
          throw new Error(`Request error ${res.error.name}: ${res.error.message}`);
        updateGoods();
      });
  }
</script>

<Grid>
  <Row>
    <Column>
      <h1>?????? ??????</h1>
    </Column>
    {#if isAccessible($userInfo, 'executive')}
      <Column style="display: flex; justify-content: end;">
        <Button
          icon={Need16}
          on:click={() => {
            rentModalOpen = true;
          }}
          disabled={!isAccessible($userInfo, 'executive')}>
          ????????????
        </Button>
        <Button
          icon={Add16}
          on:click={() => {
            addGoodsModalOpen = true;
          }}
          kind="secondary"
          disabled={!isAccessible($userInfo, 'executive')}
          >?????? ?????? ??????
        </Button>
      </Column>
    {/if}
  </Row>
  <Row>
    <Column>
      <Toggle labelText="?????? ?????? ????????? ??????" labelA="???" labelB="???" bind:toggled={rentOnly} />
    </Column>
  </Row>
  <Row style="margin-top: 1rem;">
    <Column>
      {#if allGoodies}
        <div style="display: flex; margin: 1rem 0; flex-wrap: wrap;">
          {#each Object.keys(categorizedGoods) as category}
            <ClickableTile style="margin-right: 0.5rem; margin-bottom: 0.5rem;" href="#{category}">
              {category}
            </ClickableTile>
          {/each}
        </div>
        {#if Object.keys(categorizedGoods).length > 0}
          <Accordion>
            {#each Object.entries(categorizedGoods) as [category, goodies]}
              <AccordionItem id={category}>
                <svelte:fragment slot="title">
                  <h3>{category}</h3>
                  <p>
                    {goodies.length}??? ??? {goodies.filter((goods) => goods.rentStatus === undefined)
                      .length}??? ?????? ??????
                  </p>
                </svelte:fragment>
                <DataTable
                  style="width: 100%;"
                  size="short"
                  expandable
                  nonExpandableRowIds={goodies
                    .filter((row) => row.rentStatus === undefined)
                    .map((row) => row.id)}
                  headers={[
                    { key: 'name', value: '?????????' },
                    { key: 'rentStatus', value: '?????? ??????' },
                    { key: 'overflow', empty: true },
                  ]}
                  rows={goodies}>
                  <svelte:fragment slot="cell" let:row let:cell>
                    {#if cell.key === 'rentStatus'}
                      {#if cell.value !== undefined}
                        <Tag type="red">?????? ???</Tag>
                        <Tag type="outline"
                          >{cell.value.userName}
                          / {new Date(cell.value.until).toLocaleDateString('ko')}
                          {new Date(cell.value.until).getHours()}
                          ??? ??? ?????? ??????
                        </Tag>
                      {:else}
                        <Tag type="green">?????? ??????</Tag>
                        <Tag type="outline">{groupDisplayName[row.permission]} ??????</Tag>
                      {/if}
                    {:else if cell.key === 'name'}
                      <p>{cell.value}</p>
                      <p class="bx--form__helper-text">??????: {row.location}</p>
                    {:else if cell.key === 'overflow'}
                      {#if isAccessible($userInfo, 'executive')}
                        <Button
                          iconDescription="??????"
                          kind="ghost"
                          icon={Edit16}
                          on:click={() => openUpdateGoodsModal(row)}
                          disabled={!isAccessible($userInfo, 'executive')} />
                        <Button
                          iconDescription="??????"
                          kind="ghost"
                          icon={Delete16}
                          on:click={() => openDeleteGoodsModal(row)}
                          disabled={!isAccessible($userInfo, 'executive')} />
                      {/if}
                    {:else}
                      {cell.value}
                    {/if}
                  </svelte:fragment>
                  <svelte:fragment slot="expanded-row" let:row>
                    <Grid>
                      <Row>
                        <Column>
                          <h5>??????</h5>
                          <pre>{row.rentStatus.additionalInfo}</pre>
                        </Column>
                        {#if isAccessible($userInfo, 'executive')}
                          <Column>
                            <Button
                              disabled={!isAccessible($userInfo, 'executive')}
                              on:click={() => openReturnGoodsModal(row)}
                              >?????? ??????
                            </Button>
                          </Column>
                        {/if}
                      </Row>
                    </Grid>
                  </svelte:fragment>
                </DataTable>
              </AccordionItem>
            {/each}
          </Accordion>
        {:else if rentOnly}
          <p>?????? ?????? ????????? ????????????.</p>
        {:else}
          <p>?????? ????????? ????????? ????????????.</p>
        {/if}
      {:else}
        <SkeletonText paragraph />
      {/if}
    </Column>
  </Row>
</Grid>

<Modal
  danger
  bind:open={deleteModalOpen}
  modalHeading="?????? ??????"
  primaryButtonText="??????"
  secondaryButtonText="??????"
  on:click:button--secondary={() => (deleteModalOpen = false)}
  on:open
  on:close
  on:submit={() => deleteGoods(targetGoods)}>
  <p>
    {#if targetGoods}
      ??? ????????? ????????? ??? ????????????. <br /> ?????? {targetGoods?.name}????????? ?????????????????????????
    {:else}
      <InlineNotification
        hideCloseButton
        lowContrast
        kind="error"
        title="??????:"
        subtitle="????????? ????????? ????????????." />
    {/if}
  </p>
</Modal>
<Modal
  bind:open={returnModalOpen}
  modalHeading="?????? ??????"
  primaryButtonText="??????"
  secondaryButtonText="??????"
  on:click:button--secondary={() => (returnModalOpen = false)}
  on:open
  on:close
  on:submit={() => returnGoods(targetGoods)}>
  <p>
    {#if targetGoods}
      ????????? ????????? ????????? ??? ??????????????? ????????????.<br /> ?????? {targetGoods?.name}?????????
      ?????????????????????????
    {:else}
      <InlineNotification
        hideCloseButton
        lowContrast
        kind="error"
        title="??????:"
        subtitle="????????? ????????? ????????????." />
    {/if}
  </p>
</Modal>

<AddGoodsModal bind:open={addGoodsModalOpen} on:success={() => updateGoods()} />
<UpdateGoodsModal bind:open={updateGoodsModalOpen} {targetGoods} on:success={() => updateGoods()} />
<RentModal bind:open={rentModalOpen} goodies={allGoodies} on:success={() => updateGoods()} />
