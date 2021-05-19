const SupplyChain = artifacts.require('SupplyChain')
const ConsumerRole = artifacts.require('ConsumerRole')
const RetailerRole = artifacts.require('RetailerRole')
const FarmerRole = artifacts.require('FarmerRole')
const DistributorRole = artifacts.require('DistributorRole')
const Ownable = artifacts.require('Ownable')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const expect = chai.expect
const { expectRevert } = require('@openzeppelin/test-helpers')


let isEventFound = (eventArray, eventName, argObject) => {

    let filteredArray = eventArray.filter(element => {
        if (element.event === eventName) {
            let isAllArgsFound = true
            Object.keys(argObject).forEach(key => {
                if (element.returnValues[key] !== argObject[key]) {
                    isAllArgsFound = false
                }
            })
            return isAllArgsFound
        } else {
            return false
        }
    })

    return filteredArray.length > 0

}

contract('AccessControl', (accounts) => {
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const farmerBis = accounts[5]
    const distributorBis = accounts[6]
    const ownerBis = accounts[7]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    let supplyChain, consumerRole, distributorRole, farmerRole, retailerRole, ownable

    describe("Test permissions", () => {

        beforeEach(async () => {

            supplyChain = await SupplyChain.new({ from: ownerID })
            let supplyChainEvents = await supplyChain.contract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })
            // load other contracts to check their events
            supplyChainEvents.forEach(async element => {
                switch (element.event) {
                    case 'ConsumerRoleDeployed':
                        consumerRole = await ConsumerRole.at(element.returnValues.account)
                        break;
                    case 'DistributorRoleDeployed':
                        distributorRole = await DistributorRole.at(element.returnValues.account)
                        break;
                    case 'FarmerRoleDeployed':
                        farmerRole = await FarmerRole.at(element.returnValues.account)
                        break;
                    case 'RetailerRoleDeployed':
                        retailerRole = await RetailerRole.at(element.returnValues.account)
                        break;
                    case 'OwnableDeployed':
                        ownable = await Ownable.at(element.returnValues.account)
                        break;
                    default:
                        console.log(`Event ${element.event} not managed`)
                }
            })

            // assign roles
            await supplyChain.assignFarmerRole(originFarmerID, { from: ownerID })
            await supplyChain.assignFarmerRole(farmerBis, { from: ownerID })
            await supplyChain.assignDistributorRole(distributorID, { from: ownerID })
            await supplyChain.assignDistributorRole(distributorBis, { from: ownerID })
            await supplyChain.assignConsumerRole(consumerID, { from: ownerID })
            await supplyChain.assignRetailerRole(retailerID, { from: ownerID })

        })


        it("Check permissions assigned by owner", async () => {
            // check roles assigned correctly
            expect(await supplyChain.isFarmer(originFarmerID), 'Farmer role was not assigned to farmer').to.equal(true)
            expect(await supplyChain.isDistributor(distributorID), 'Distributor role was not assigned to distributor').to.equal(true)
            expect(await supplyChain.isConsumer(consumerID), 'Consumer role was not assigned to consumer').to.equal(true)
            expect(await supplyChain.isRetailer(retailerID), 'Retailer role was not assigned to retailer').to.equal(true)

            // check events emitted
            let consumerRoleEvents = await consumerRole.contract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })
            let distributorRoleEvents = await distributorRole.contract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })
            let retailerRoleEvents = await retailerRole.contract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })
            let farmerRoleEvents = await farmerRole.contract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })
            let ownableEvents = await ownable.contract.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })

            expect(isEventFound(consumerRoleEvents, 'ConsumerAdded', { account: consumerID })).to.equal(true)
            expect(isEventFound(distributorRoleEvents, 'DistributorAdded', { account: distributorID })).to.equal(true)
            expect(isEventFound(retailerRoleEvents, 'RetailerAdded', { account: retailerID })).to.equal(true)
            expect(isEventFound(farmerRoleEvents, 'FarmerAdded', { account: originFarmerID })).to.equal(true)
            expect(isEventFound(ownableEvents, 'TransferOwnership', { newOwner: ownerID })).to.equal(true)

            // check roles not assigned to the wrong stakeholders
            expect(await supplyChain.isDistributor(originFarmerID), 'Farmer is not distributor').to.equal(false)
            expect(await supplyChain.isConsumer(originFarmerID), 'Farmer is not consumer').to.equal(false)
            expect(await supplyChain.isRetailer(originFarmerID), 'Farmer is not retailer').to.equal(false)
            expect(await supplyChain.isFarmer(distributorID), 'Distributor is not farmer').to.equal(false)

        })

        it("Check a stakeholder can renounce its role", async () => {
            expect(await supplyChain.isFarmer(originFarmerID), 'Farmer role was not assigned to farmer').to.equal(true)
            await supplyChain.renounceFarmer({ from: originFarmerID })
            expect(await supplyChain.isFarmer(originFarmerID), 'Farmer was not able to renounce').to.equal(false)

            expect(await supplyChain.isDistributor(distributorID), 'Distributor role was not assigned to distributor').to.equal(true)
            await supplyChain.renounceDistributor({ from: distributorID })
            expect(await supplyChain.isDistributor(distributorID), 'Distributor was not able to renounce').to.equal(false)

            expect(await supplyChain.isConsumer(consumerID), 'Consumer role was not assigned to consumer').to.equal(true)
            await supplyChain.renounceConsumer({ from: consumerID })
            expect(await supplyChain.isConsumer(consumerID), 'Consumer was not able to renounce').to.equal(false)

            expect(await supplyChain.isRetailer(retailerID), 'Retailer role was not assigned to retailere').to.equal(true)
            await supplyChain.renounceRetailer({ from: retailerID })
            expect(await supplyChain.isRetailer(retailerID), 'Retailer was not able to renounce').to.equal(false)
        })

        it("Check transfer of ownership", async () => {
            // at start, the owner is the 1st account
            let owner = await supplyChain.owner()
            expect(owner, 'Owner of the contract is not correct').to.equal(ownerID)
            // Another person than owner cannot transfer ownerhsip
            await expectRevert(supplyChain.transferOwnership(ownerBis, { from: distributorID }), 'Must be owner of the contract to call this functionality')

            // ok if owner transfers ownership
            await supplyChain.transferOwnership(ownerBis, { from: ownerID })
            owner = await supplyChain.owner()
            expect(owner, 'Owner of the contract is not correct').to.equal(ownerBis)

            //check event
            let ownableEvents = await ownable.contract.getPastEvents('allEvents') // no need fromBlock toBlock, will get event from last block
            expect(isEventFound(ownableEvents, 'TransferOwnership', { oldOwner: ownerID, newOwner: ownerBis })).to.equal(true)

            // previous owner cannot transfer ownership anymore
            await expectRevert(supplyChain.transferOwnership(ownerID, { from: distributorID }), 'Must be owner of the contract to call this functionality')

        })

        it("Check renounce ownership", async () => {
            let owner = await supplyChain.owner()
            expect(owner, 'Owner of the contract is not correct').to.equal(ownerID)
            await supplyChain.renounceOwnership({ from: ownerID })
            // address is 0x0
            owner = await supplyChain.owner()
            expect(owner, 'Owner of the contract is not correct').to.equal(emptyAddress)

            let ownableEvents = await ownable.contract.getPastEvents('allEvents') // no need fromBlock toBlock, will get event from last block

            expect(isEventFound(ownableEvents, 'TransferOwnership', { oldOwner: ownerID, newOwner: emptyAddress })).to.equal(true)


        })

        it("Owner can detruct the contract", async () => {
            let owner = await supplyChain.owner()
            expect(owner, 'Owner of the contract is not correct').to.equal(ownerID)

            // nothing happen if someonelese kills the contract
            await supplyChain.kill({ from: ownerBis })
            expect(owner, 'Owner of the contract is not correct').to.equal(ownerID)


            await supplyChain.kill({ from: ownerID })

            // error if we try to get owner. Infact, we cannot call methods anymore
            expect(supplyChain.owner()).to.be.rejected


        })

        describe("Check access to functionalities", () => {
            let upc = 1
            const originFarmName = "John Doe"
            const originFarmInformation = "Yarray Valley"
            const originFarmLatitude = "-38.239770"
            const originFarmLongitude = "144.341490"
            const productNotes = "Best beans for Espresso"
            const productPrice = web3.utils.toWei('1', "ether")

            describe('Farmer roles', () => {
                it("Only farmer can harvest", async () => {
                    // confirm someone with another role cannot call harvest
                    await expectRevert(supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: distributorID }), 'Only a farmer can call this functionality')
                    // Farmer harvest
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                })

                it("Only farmer can process", async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    // confirm someone with another role cannot call harvest
                    await expectRevert(supplyChain.processItem(upc, { from: distributorID }), 'Only a farmer can call this functionality')
                    await supplyChain.processItem(upc, { from: originFarmerID })

                })

                it("Another farmer cannot process", async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    // confirm someone with another role cannot call harvest
                    await expectRevert(supplyChain.processItem(upc, { from: farmerBis }), 'Caller not allowed to call this function')
                })

                it("Only farmer can pack", async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    await supplyChain.processItem(upc, { from: originFarmerID })
                    // confirm someone with another role cannot call harvest
                    await expectRevert(supplyChain.packItem(upc, { from: distributorID }), 'Only a farmer can call this functionality')
                    await supplyChain.packItem(upc, { from: originFarmerID })

                })

                it("Another farmer cannot pack", async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    await supplyChain.processItem(upc, { from: originFarmerID })
                    // confirm someone with another role cannot call harvest
                    await expectRevert(supplyChain.packItem(upc, { from: farmerBis }), 'Caller not allowed to call this function')
                })

                it("Only farmer can sell", async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    await supplyChain.processItem(upc, { from: originFarmerID })
                    await supplyChain.packItem(upc, { from: originFarmerID })
                    // confirm someone with another role cannot call harvest
                    await expectRevert(supplyChain.sellItem(upc, productPrice, { from: distributorID }), 'Only a farmer can call this functionality')
                    await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

                })

                it("Another farmer cannot sell", async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    await supplyChain.processItem(upc, { from: originFarmerID })
                    await supplyChain.packItem(upc, { from: originFarmerID })
                    // confirm someone with another role cannot call harvest
                    await expectRevert(supplyChain.sellItem(upc, productPrice, { from: farmerBis }), 'Caller not allowed to call this function')

                })
            })

            describe('Distributor roles', () => {
                beforeEach(async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    await supplyChain.processItem(upc, { from: originFarmerID })
                    await supplyChain.packItem(upc, { from: originFarmerID })
                    await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

                })
                it("Only Distributor can buy", async () => {
                    await expectRevert(supplyChain.buyItem(upc, { from: consumerID, value: productPrice }), 'Only a Distributor can call this functionality')
                    await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
                })

                it("Only Distributor can ship", async () => {
                    await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
                    await expectRevert(supplyChain.shipItem(upc, { from: consumerID }), 'Only a Distributor can call this functionality')
                    await supplyChain.shipItem(upc, { from: distributorID })
                })

                it("Another Distributor cannot ship", async () => {
                    await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
                    await expectRevert(supplyChain.shipItem(upc, { from: distributorBis }), 'Caller not allowed to call this function')
                })

            })

            describe('Retailer roles', () => {

                beforeEach(async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    await supplyChain.processItem(upc, { from: originFarmerID })
                    await supplyChain.packItem(upc, { from: originFarmerID })
                    await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
                    await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
                    await supplyChain.shipItem(upc, { from: distributorID })
                })

                it("Only Retailer can receive", async () => {
                    await expectRevert(supplyChain.receiveItem(upc, { from: consumerID, }), 'Only a Retailer can call this functionality')
                    await supplyChain.receiveItem(upc, { from: retailerID })
                })

            })


            describe('Consumer roles', () => {

                beforeEach(async () => {
                    await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                    await supplyChain.processItem(upc, { from: originFarmerID })
                    await supplyChain.packItem(upc, { from: originFarmerID })
                    await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
                    await supplyChain.buyItem(upc, { from: distributorID, value: productPrice })
                    await supplyChain.shipItem(upc, { from: distributorID })
                    await supplyChain.receiveItem(upc, { from: retailerID })
                })

                it("Only Consumer can purchase", async () => {
                    await expectRevert(supplyChain.purchaseItem(upc, { from: originFarmerID, value: web3.utils.toWei('2', 'ether') }), 'Only a Consumer can call this functionality')
                    await supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', 'ether') })
                })

            })

        })

    })
})




