const SupplyChain = artifacts.require('SupplyChain')
const { expect } = require('chai')
const { expectRevert } = require('@openzeppelin/test-helpers')


contract('NegativeCases', (accounts) => {
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    let upc = 1
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei('1', "ether")

    let supplyChain

    beforeEach(async () => {

        supplyChain = await SupplyChain.new({ from: ownerID })

        const owner = await supplyChain.owner()
        expect(owner, 'Owner of the contract is not correct').to.equal(ownerID)
        // assign roles
        await supplyChain.assignFarmerRole(originFarmerID, { from: ownerID })
        await supplyChain.assignDistributorRole(distributorID, { from: ownerID })
        await supplyChain.assignConsumerRole(consumerID, { from: ownerID })
        await supplyChain.assignRetailerRole(retailerID, { from: ownerID })
    })

    describe("Test state transition", () => {

        it("1st transtion - Cannot do other task than harvest", async () => {
            await expectRevert(supplyChain.processItem(upc, { from: originFarmerID }), 'State must be harvested')
            await expectRevert(supplyChain.packItem(upc, { from: originFarmerID }), 'State must be processed')
            await expectRevert(supplyChain.sellItem(upc, productPrice, { from: originFarmerID }), 'State must be packed')
            await expectRevert(supplyChain.buyItem(upc, { from: distributorID, value: productPrice }), 'State must be for sale')
            await expectRevert(supplyChain.shipItem(upc, { from: distributorID }), 'State must be sold')
            await expectRevert(supplyChain.receiveItem(upc, { from: retailerID }), 'State must be shipped')
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') }), 'State must be received')
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
        })

        it("2nd transtion - Cannot do other task than process", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await expectRevert(supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID }), 'State must be none')
            await expectRevert(supplyChain.packItem(upc, { from: originFarmerID }), 'State must be processed')
            await expectRevert(supplyChain.sellItem(upc, productPrice, { from: originFarmerID }), 'State must be packed')
            await expectRevert(supplyChain.buyItem(upc, { from: distributorID, value: productPrice }), 'State must be for sale')
            await expectRevert(supplyChain.shipItem(upc, { from: distributorID }), 'State must be sold')
            await expectRevert(supplyChain.receiveItem(upc, { from: retailerID }), 'State must be shipped')
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') }), 'State must be received')
            await supplyChain.processItem(upc, { from: originFarmerID })
        })

        it("3rd transtion - Cannot do other task than pack", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await expectRevert(supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID }), 'State must be none')
            await expectRevert(supplyChain.processItem(upc, { from: originFarmerID }), 'State must be harvested')
            await expectRevert(supplyChain.sellItem(upc, productPrice, { from: originFarmerID }), 'State must be packed')
            await expectRevert(supplyChain.buyItem(upc, { from: distributorID, value: productPrice }), 'State must be for sale')
            await expectRevert(supplyChain.shipItem(upc, { from: distributorID }), 'State must be sold')
            await expectRevert(supplyChain.receiveItem(upc, { from: retailerID }), 'State must be shipped')
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') }), 'State must be received')
            await supplyChain.packItem(upc, { from: originFarmerID })
        })

        it("4th transtion - Cannot do other task than sell", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await expectRevert(supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID }), 'State must be none')
            await expectRevert(supplyChain.processItem(upc, { from: originFarmerID }), 'State must be harvested')
            await expectRevert(supplyChain.buyItem(upc, { from: distributorID, value: productPrice }), 'State must be for sale')
            await expectRevert(supplyChain.shipItem(upc, { from: distributorID }), 'State must be sold')
            await expectRevert(supplyChain.receiveItem(upc, { from: retailerID }), 'State must be shipped')
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') }), 'State must be received')
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
        })

        it("5th transtion - Cannot do other task than buy", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
            await expectRevert(supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID }), 'State must be none')
            await expectRevert(supplyChain.processItem(upc, { from: originFarmerID }), 'State must be harvested')
            await expectRevert(supplyChain.shipItem(upc, { from: distributorID }), 'State must be sold')
            await expectRevert(supplyChain.receiveItem(upc, { from: retailerID }), 'State must be shipped')
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') }), 'State must be received')
            await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
        })

        it("6th transtion - Cannot do other task than ship", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
            await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
            await expectRevert(supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID }), 'State must be none')
            await expectRevert(supplyChain.processItem(upc, { from: originFarmerID }), 'State must be harvested')
            await expectRevert(supplyChain.packItem(upc, { from: originFarmerID }), 'State must be processed')
            await expectRevert(supplyChain.receiveItem(upc, { from: retailerID }), 'State must be shipped')
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') }), 'State must be received')
            await supplyChain.shipItem(upc, { from: distributorID })
        })

        it("7th transtion - Cannot do other task than receive", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
            await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
            await supplyChain.shipItem(upc, { from: distributorID })
            await expectRevert(supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID }), 'State must be none')
            await expectRevert(supplyChain.processItem(upc, { from: originFarmerID }), 'State must be harvested')
            await expectRevert(supplyChain.packItem(upc, { from: originFarmerID }), 'State must be processed')
            await expectRevert(supplyChain.sellItem(upc, productPrice, { from: originFarmerID }), 'State must be packed')
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') }), 'State must be received')
            await supplyChain.receiveItem(upc, { from: retailerID })
        })

        it("8th transtion - Cannot do other task than purchase", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
            await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
            await supplyChain.shipItem(upc, { from: distributorID })
            await supplyChain.receiveItem(upc, { from: retailerID })
            await expectRevert(supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID }), 'State must be none')
            await expectRevert(supplyChain.processItem(upc, { from: originFarmerID }), 'State must be harvested')
            await expectRevert(supplyChain.packItem(upc, { from: originFarmerID }), 'State must be processed')
            await expectRevert(supplyChain.sellItem(upc, productPrice, { from: originFarmerID }), 'State must be packed')
            await expectRevert(supplyChain.buyItem(upc, { from: distributorID, value: productPrice }), 'State must be for sale')
            await expectRevert(supplyChain.shipItem(upc, { from: distributorID }), 'State must be sold')
            await expectRevert(supplyChain.receiveItem(upc, { from: retailerID }), 'State must be shipped')
            await supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') })
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') }), 'State must be received')
        })

    })

    describe("Test price values", () => {


        it("Price item must be stricly positif", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await expectRevert(supplyChain.sellItem(upc, '0', { from: originFarmerID }), 'Price must be >0')
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
        })

        it("Distributor must pay enough", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
            await expectRevert(supplyChain.buyItem(upc, { from: distributorID, value: '1' }), 'The value sent does not cover the price')
            await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
        })

        it("Consumer must pay enough", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
            await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
            await supplyChain.shipItem(upc, { from: distributorID })
            await supplyChain.receiveItem(upc, { from: retailerID })
            await expectRevert(supplyChain.purchaseItem(upc, { from: consumerID, value: '1' }), 'The value sent does not cover the price')
            await supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') })

        })
    })

    describe("Test record transaction history", () => {
        it("History is empty at the beginning", async () => {
            let transactionHistory = await supplyChain.getItemHistory(upc)
            expect(transactionHistory.length, 'Transaction history should be empty').to.equal(0)

        })

        it("History cannot be recorded for non existant upc", async () => {
            await expectRevert(supplyChain.recordHistory(10, 'test'), 'State must be valid')
        })

        it("History cannot be recorded for wrong upc value", async () => {
            await expectRevert(supplyChain.recordHistory(0, 'test'), 'UPC not valid')
        })

        it("History cannot be recorded for empty transaction hash", async () => {
            await expectRevert(supplyChain.recordHistory(10, ''), 'Transaction hash cannot be empty')
        })

        it("History cannot be recorded by non item owner", async () => {
            let result = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await expectRevert(supplyChain.recordHistory(upc, 'test', { from: distributorID }), 'Caller not allowed to call this function')
            // Farmer can record hash
            await supplyChain.recordHistory(upc, result.tx, { from: originFarmerID })
            let transactionHistory = await supplyChain.getItemHistory(upc)

            expect(transactionHistory.length, 'Transaction history must contain exactly one element').to.equal(1)
            expect(transactionHistory[0], 'Transaction history must contain the previous transaction hash').to.equal(result.tx)
        })



    })

})